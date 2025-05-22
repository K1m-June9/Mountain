import json
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend import models, schemas
from backend.api import deps

router = APIRouter()

@router.get("/{post_id}/comments", response_model=List[schemas.CommentWithReplies])
def read_comments_by_post(
    post_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    게시물의 댓글 목록 조회
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 숨겨진 게시물은 관리자나 중재자만 볼 수 있음
    if post.is_hidden and (not current_user or (current_user.role != "admin" and current_user.role != "moderator")):
        raise HTTPException(status_code=403, detail="Post is hidden")
    
    # 최상위 댓글만 가져옴 (parent_id가 NULL)
    query = db.query(models.Comment).filter(
        models.Comment.post_id == post_id,
        models.Comment.parent_id == None
    )
    
    # 관리자나 중재자가 아니면 숨겨진 댓글 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Comment.is_hidden == False)
    
    # 최신순 정렬
    query = query.order_by(models.Comment.created_at.desc())
    
    # 페이지네이션
    comments = query.offset(skip).limit(limit).all()
    
    # 결과 구성
    result = []
    for comment in comments:
        # 좋아요/싫어요 수 계산
        like_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == comment.id,
            models.Reaction.type == "like"
        ).scalar()
        
        dislike_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == comment.id,
            models.Reaction.type == "dislike"
        ).scalar()
        
        # 현재 사용자의 반응 상태 확인 (로그인한 경우만)
        liked_by_me = False
        disliked_by_me = False
        if current_user:
            liked_by_me = db.query(models.Reaction).filter(
                models.Reaction.comment_id == comment.id,
                models.Reaction.user_id == current_user.id,
                models.Reaction.type == "like"
            ).first() is not None
            
            disliked_by_me = db.query(models.Reaction).filter(
                models.Reaction.comment_id == comment.id,
                models.Reaction.user_id == current_user.id,
                models.Reaction.type == "dislike"
            ).first() is not None
        
        # 답글 가져오기
        replies = []
        for reply in comment.replies:
            # 숨겨진 답글 필터링
            if reply.is_hidden and (not current_user or (current_user.role != "admin" and current_user.role != "moderator")):
                continue
            
            # 답글의 좋아요/싫어요 수 계산
            reply_like_count = db.query(func.count(models.Reaction.id)).filter(
                models.Reaction.comment_id == reply.id,
                models.Reaction.type == "like"
            ).scalar()
            
            reply_dislike_count = db.query(func.count(models.Reaction.id)).filter(
                models.Reaction.comment_id == reply.id,
                models.Reaction.type == "dislike"
            ).scalar()
            
            # 현재 사용자의 답글 반응 상태 확인 (로그인한 경우만)
            reply_liked_by_me = False
            reply_disliked_by_me = False
            if current_user:
                reply_liked_by_me = db.query(models.Reaction).filter(
                    models.Reaction.comment_id == reply.id,
                    models.Reaction.user_id == current_user.id,
                    models.Reaction.type == "like"
                ).first() is not None
                
                reply_disliked_by_me = db.query(models.Reaction).filter(
                    models.Reaction.comment_id == reply.id,
                    models.Reaction.user_id == current_user.id,
                    models.Reaction.type == "dislike"
                ).first() is not None
            
            # 답글 객체 생성
            reply_dict = {
                **schemas.Comment.model_validate(reply).model_dump(),
                "user": schemas.User.model_validate(reply.user),
                "like_count": reply_like_count,
                "dislike_count": reply_dislike_count,
                "liked_by_me": reply_liked_by_me,
                "disliked_by_me": reply_disliked_by_me
            }
            replies.append(schemas.CommentWithUser(**reply_dict))
        
        # 댓글 객체 생성
        comment_dict = {
            **schemas.Comment.model_validate(comment).model_dump(),
            "user": schemas.User.model_validate(comment.user),
            "like_count": like_count,
            "dislike_count": dislike_count,
            "liked_by_me": liked_by_me,
            "disliked_by_me": disliked_by_me,
            "replies": replies
        }
        result.append(schemas.CommentWithReplies(**comment_dict))

    return result


@router.post("/", response_model=schemas.Comment)
def create_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_in: schemas.CommentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    새 댓글 생성
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == comment_in.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 숨겨진 게시물에는 댓글을 달 수 없음
    if post.is_hidden:
        raise HTTPException(status_code=403, detail="Cannot comment on hidden post")
    
    # 부모 댓글 존재 확인 (답글인 경우)
    if comment_in.parent_id:
        parent_comment = db.query(models.Comment).filter(models.Comment.id == comment_in.parent_id).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        
        # 부모 댓글이 숨겨져 있으면 답글을 달 수 없음
        if parent_comment.is_hidden:
            raise HTTPException(status_code=403, detail="Cannot reply to hidden comment")
        
        # 부모 댓글과 같은 게시물에만 답글을 달 수 있음
        if parent_comment.post_id != comment_in.post_id:
            raise HTTPException(status_code=400, detail="Parent comment belongs to different post")
    
    # 댓글 생성 - dict() 대신 model_dump() 사용
    comment = models.Comment(
        **comment_in.model_dump(),
        user_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="create_comment",
        description=f"User {current_user.username} created comment {comment.id} on post {comment.post_id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return comment


@router.put("/{comment_id}", response_model=schemas.Comment)
def update_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    comment_in: schemas.CommentUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 수정
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 자신의 댓글만 수정 가능 (관리자/중재자 제외)
    if comment.user_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 관리자/중재자만 숨김 상태 변경 가능
    if comment_in.is_hidden is not None and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions to change visibility")
    
    # 댓글 내용 수정 (자신의 댓글인 경우만)
    if comment_in.content is not None and comment.user_id == current_user.id:
        comment.content = comment_in.content
    
    # 숨김 상태 변경 (관리자/중재자만)
    if comment_in.is_hidden is not None and current_user.role in ["admin", "moderator"]:
        comment.is_hidden = comment_in.is_hidden
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_comment",
        description=f"User {current_user.username} updated comment {comment.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return comment


@router.delete("/{comment_id}", response_model=schemas.Comment)
def delete_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 삭제
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 자신의 댓글만 삭제 가능 (관리자/중재자 제외)
    if comment.user_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="delete_comment",
        description=f"User {current_user.username} deleted comment {comment.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    
    # 댓글 삭제
    db.delete(comment)
    db.commit()
    
    return comment


@router.post("/{comment_id}/like", response_model=schemas.Reaction)
def like_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 좋아요
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 숨겨진 댓글에는 좋아요를 할 수 없음
    if comment.is_hidden:
        raise HTTPException(status_code=403, detail="Cannot like hidden comment")
    
    # 이미 좋아요한 경우 확인
    existing_like = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.comment_id == comment_id,
        models.Reaction.type == "like"
    ).first()
    
    if existing_like:
        # 이미 좋아요한 경우 좋아요 취소
        db.delete(existing_like)
        db.commit()
        return existing_like
    
    # 싫어요가 있는 경우 삭제
    existing_dislike = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.comment_id == comment_id,
        models.Reaction.type == "dislike"
    ).first()
    
    if existing_dislike:
        db.delete(existing_dislike)
        db.commit()
    
    # 좋아요 생성
    reaction = models.Reaction(
        user_id=current_user.id,
        comment_id=comment_id,
        type="like"
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    return reaction


@router.post("/{comment_id}/dislike", response_model=schemas.Reaction)
def dislike_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 싫어요
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 숨겨진 댓글에는 싫어요를 할 수 없음
    if comment.is_hidden:
        raise HTTPException(status_code=403, detail="Cannot dislike hidden comment")
    
    # 이미 싫어요한 경우 확인
    existing_dislike = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.comment_id == comment_id,
        models.Reaction.type == "dislike"
    ).first()
    
    if existing_dislike:
        # 이미 싫어요한 경우 싫어요 취소
        db.delete(existing_dislike)
        db.commit()
        return existing_dislike
    
    # 좋아요가 있는 경우 삭제
    existing_like = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.comment_id == comment_id,
        models.Reaction.type == "like"
    ).first()
    
    if existing_like:
        db.delete(existing_like)
        db.commit()
    
    # 싫어요 생성
    reaction = models.Reaction(
        user_id=current_user.id,
        comment_id=comment_id,
        type="dislike"
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    return reaction


@router.post("/{comment_id}/report", response_model=schemas.Report)
def report_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    report_in: schemas.ReportCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 신고
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 이미 신고한 경우 확인
    existing_report = db.query(models.Report).filter(
        models.Report.reporter_id == current_user.id,
        models.Report.comment_id == comment_id
    ).first()
    
    if existing_report:
        raise HTTPException(status_code=400, detail="You have already reported this comment")
    
    # 신고 생성
    report = models.Report(
        reporter_id=current_user.id,
        comment_id=comment_id,
        reason=report_in.reason,
        description=report_in.description,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 신고 횟수 확인
    report_count = db.query(func.count(models.Report.id)).filter(
        models.Report.comment_id == comment_id,
        models.Report.status != "rejected"
    ).scalar()
    
    # 신고 임계값 설정 가져오기
    report_threshold = 3  # 기본값
    threshold_setting = db.query(models.Setting).filter(models.Setting.key_name == "report_threshold").first()
    if threshold_setting:
        report_threshold = int(threshold_setting.value)
    
    # 신고 횟수가 임계값을 넘으면 자동으로 숨김 처리
    if report_count >= report_threshold:
        comment.is_hidden = True
        db.add(comment)
        db.commit()
    
    return report

@router.get("/{comment_id}/replies", response_model=List[schemas.CommentWithUser])
def read_comment_replies(
    comment_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 댓글의 답글 목록 조회
    """
    # 댓글 존재 확인
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 숨겨진 댓글의 답글은 관리자나 중재자만 볼 수 있음
    if comment.is_hidden and (not current_user or (current_user.role != "admin" and current_user.role != "moderator")):
        raise HTTPException(status_code=403, detail="Comment is hidden")
    
    # 답글 가져오기 (parent_id가 comment_id인 댓글)
    query = db.query(models.Comment).filter(
        models.Comment.parent_id == comment_id
    )
    
    # 관리자나 중재자가 아니면 숨겨진 답글 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Comment.is_hidden == False)
    
    # 최신순 정렬
    query = query.order_by(models.Comment.created_at.desc())
    
    # 페이지네이션
    replies = query.offset(skip).limit(limit).all()
    
    # 결과 구성
    result = []
    for reply in replies:
        # 좋아요/싫어요 수 계산
        like_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == reply.id,
            models.Reaction.type == "like"
        ).scalar()
        
        dislike_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == reply.id,
            models.Reaction.type == "dislike"
        ).scalar()
        
        # 답글 객체 생성
        reply_dict = {
            **schemas.Comment.model_validate(reply).model_dump(),
            "user": schemas.User.model_validate(reply.user),
            "like_count": like_count,
            "dislike_count": dislike_count
        }
        result.append(schemas.CommentWithUser(**reply_dict))
    
    return result

@router.get("/user/{user_id}", response_model=List[schemas.CommentWithUser])
def read_comments_by_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자가 작성한 댓글 목록 조회
    """
    # 사용자 존재 확인
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 사용자의 댓글 조회
    query = db.query(models.Comment).filter(models.Comment.user_id == user_id)
    
    # 관리자나 중재자가 아니고, 자신의 댓글이 아니면 숨겨진 댓글 제외
    if not current_user or (current_user.id != user_id and current_user.role not in ["admin", "moderator"]):
        query = query.filter(models.Comment.is_hidden == False)
    
    # 최신순 정렬
    query = query.order_by(models.Comment.created_at.desc())
    
    # 페이지네이션
    comments = query.offset(skip).limit(limit).all()
    
    # 결과 구성
    result = []
    for comment in comments:
        # 좋아요/싫어요 수 계산
        like_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == comment.id,
            models.Reaction.type == "like"
        ).scalar()
        
        dislike_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.comment_id == comment.id,
            models.Reaction.type == "dislike"
        ).scalar()
        
        # 게시물 제목 가져오기
        post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
        post_title = post.title if post else f"게시물 #{comment.post_id}"
        
        # 댓글 객체 생성
        comment_dict = {
            **schemas.Comment.model_validate(comment).model_dump(),
            "user": schemas.User.model_validate(comment.user),
            "like_count": like_count,
            "dislike_count": dislike_count,
            "post_title": post_title  # 게시물 제목 추가
        }
        result.append(schemas.CommentWithUser(**comment_dict))
    
    return result

@router.put("/{comment_id}/hide", response_model=schemas.Comment)
def hide_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 숨김 처리
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 관리자/중재자만 숨김 처리 가능
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 이미 숨김 처리된 경우
    if comment.is_hidden:
        return comment
    
    # 숨김 처리
    comment.is_hidden = True
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="hide_comment",
        description=f"Admin {current_user.username} hid comment {comment.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return comment

@router.put("/{comment_id}/unhide", response_model=schemas.Comment)
def unhide_comment(
    *,
    db: Session = Depends(deps.get_db),
    comment_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    댓글 숨김 해제
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # 관리자/중재자만 숨김 해제 가능
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 이미 표시 중인 경우
    if not comment.is_hidden:
        return comment
    
    # 숨김 해제
    comment.is_hidden = False
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="unhide_comment",
        description=f"Admin {current_user.username} unhid comment {comment.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return comment