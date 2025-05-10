from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.PostWithDetails])
def read_posts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    category_id: Optional[int] = None,
    institution_id: Optional[int] = None,
    current_user: Optional[models.User] = Depends(deps.get_current_user),
) -> Any:
    """
    게시물 목록 조회
    """
    query = db.query(models.Post)
    
    # 카테고리 필터링
    if category_id:
        query = query.filter(models.Post.category_id == category_id)
    
    # 기관 필터링
    if institution_id:
        query = query.filter(models.Post.institution_id == institution_id)
    
    # 관리자나 중재자가 아니면 숨겨진 게시물 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Post.is_hidden == False)
    
    # 최신순 정렬
    query = query.order_by(models.Post.created_at.desc())
    
    # 페이지네이션
    posts = query.offset(skip).limit(limit).all()
    
    # 추가 정보 포함
    result = []
    for post in posts:
        # 댓글 수 계산
        comment_count = db.query(func.count(models.Comment.id)).filter(
            models.Comment.post_id == post.id,
            models.Comment.is_hidden == False
        ).scalar()
        
        # 좋아요/싫어요 수 계산
        like_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.post_id == post.id,
            models.Reaction.type == "like"
        ).scalar()
        
        dislike_count = db.query(func.count(models.Reaction.id)).filter(
            models.Reaction.post_id == post.id,
            models.Reaction.type == "dislike"
        ).scalar()
        
        # PostWithDetails 객체 생성
        post_dict = {
            **schemas.Post.from_orm(post).dict(),
            "user": schemas.User.from_orm(post.user),
            "institution": schemas.Institution.from_orm(post.institution) if post.institution else None,
            "category": schemas.Category.from_orm(post.category) if post.category else None,
            "images": [schemas.PostImage.from_orm(image) for image in post.images],
            "comment_count": comment_count,
            "like_count": like_count,
            "dislike_count": dislike_count
        }
        result.append(schemas.PostWithDetails(**post_dict))
    
    return result


@router.post("/", response_model=schemas.Post)
def create_post(
    *,
    db: Session = Depends(deps.get_db),
    post_in: schemas.PostCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    새 게시물 생성
    """
    post = models.Post(
        **post_in.dict(),
        user_id=current_user.id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="create_post",
        description=f"User {current_user.username} created post {post.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return post


@router.get("/{post_id}", response_model=schemas.PostWithDetails)
def read_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: Optional[models.User] = Depends(deps.get_current_user),
) -> Any:
    """
    특정 게시물 조회
    """
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 숨겨진 게시물은 관리자나 중재자만 볼 수 있음
    if post.is_hidden and (not current_user or (current_user.role != "admin" and current_user.role != "moderator")):
        raise HTTPException(status_code=403, detail="Post is hidden")
    
    # 조회수 증가
    post.view_count += 1
    db.commit()
    
    # 댓글 수 계산
    comment_count = db.query(func.count(models.Comment.id)).filter(
        models.Comment.post_id == post.id,
        models.Comment.is_hidden == False
    ).scalar()
    
    # 좋아요/싫어요 수 계산
    like_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post.id,
        models.Reaction.type == "like"
    ).scalar()
    
    dislike_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post.id,
        models.Reaction.type == "dislike"
    ).scalar()
    
    # PostWithDetails 객체 생성
    post_dict = {
        **schemas.Post.from_orm(post).dict(),
        "user": schemas.User.from_orm(post.user),
        "institution": schemas.Institution.from_orm(post.institution) if post.institution else None,
        "category": schemas.Category.from_orm(post.category) if post.category else None,
        "images": [schemas.PostImage.from_orm(image) for image in post.images],
        "comment_count": comment_count,
        "like_count": like_count,
        "dislike_count": dislike_count
    }
    
    return schemas.PostWithDetails(**post_dict)