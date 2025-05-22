import datetime
import uuid
import os

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from backend import models, schemas
from backend.api import deps

router = APIRouter()

@router.post("/images/upload", response_model=schemas.PostImage) #경로 변경
def upload_post_image(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    post_id: Optional[int] = Form(None),  # Form 파라미터로 post_id 추가
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물 이미지 업로드
    """
    # 파일 확장자 검사
    allowed_extensions = ["jpg", "jpeg", "png", "gif"]
    file_extension = file.filename.split(".")[-1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. 지원되는 형식: {', '.join(allowed_extensions)}"
        )
    
    # 파일 크기 제한 (5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_size = 0
    contents = b""
    
    # 파일 내용 읽기
    for chunk in file.file:
        contents += chunk
        file_size += len(chunk)
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 너무 큽니다. 최대 크기: 5MB"
            )
    
    # post_id가 제공된 경우 게시물 존재 여부 확인
    if post_id:
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # 권한 확인: 작성자 또는 관리자만 이미지 추가 가능
        if post.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 파일명 생성 (고유한 이름으로 변경)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    unique_filename = f"{timestamp}_{uuid.uuid4().hex}.{file_extension}"
    
    # 파일 저장 경로
    upload_dir = "uploads/posts"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 파일 저장
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # 이미지 URL 생성
    image_url = f"/uploads/posts/{unique_filename}"
    
    # 이미지 정보 저장 (post_id 연결)
    post_image = models.PostImage(
        image_url=image_url,
        post_id=post_id  # post_id 설정
    )
    db.add(post_image)
    db.commit()
    db.refresh(post_image)
    
    return post_image



@router.get("/", response_model=List[schemas.PostWithDetails])
def read_posts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    category_id: Optional[int] = None,
    institution_id: Optional[int] = None,
    user_id: Optional[int] = None,  # user_id 파라미터 추가
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
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
    
    # 사용자 필터링 (추가된 부분)
    if user_id:
        query = query.filter(models.Post.user_id == user_id)
    
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
            **schemas.Post.model_validate(post).model_dump(),
            "user": schemas.User.model_validate(post.user),
            "institution": schemas.Institution.model_validate(post.institution) if post.institution else None,
            "category": schemas.Category.model_validate(post.category) if post.category else None,
            "images": [schemas.PostImage.model_validate(image) for image in post.images],
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
        **post_in.model_dump(),
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

# 기존 search_posts 함수 수정
@router.get("/search")#, response_model=schemas.PostSearchResponse
def search_posts(
    *,
    db: Session = Depends(deps.get_db),
    q: str = Query(None, description="검색어"),  # 필수에서 선택적으로 변경
    skip: int = 0,
    limit: int = 50,
    sort: str = Query("recent", description="정렬 방식 (recent, old, views, likes, comments)"),
    category_id: Optional[int] = None,
    institution_id: Optional[int] = None,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    게시물 검색 (제목만 검색)
    """
    query = db.query(models.Post)
    
    # 검색어로 필터링 (제목에서만 검색)
    if q:
        query = query.filter(models.Post.title.ilike(f"%{q}%"))
    
    # 카테고리 필터링
    if category_id:
        query = query.filter(models.Post.category_id == category_id)
    
    # 기관 필터링
    if institution_id:
        query = query.filter(models.Post.institution_id == institution_id)
    
    # 관리자나 중재자가 아니면 숨겨진 게시물 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Post.is_hidden == False)
    
    # 정렬 방식 적용
    if sort == "old":
        query = query.order_by(models.Post.created_at.asc())
    elif sort == "views":
        query = query.order_by(models.Post.view_count.desc())
    elif sort == "likes":
        # 좋아요 수로 정렬 (서브쿼리 사용)
        like_count = db.query(
            models.Post.id,
            func.count(models.Reaction.id).label("like_count")
        ).outerjoin(
            models.Reaction, 
            and_(
                models.Reaction.post_id == models.Post.id,
                models.Reaction.type == "like"
            )
        ).group_by(models.Post.id).subquery()
        
        query = query.outerjoin(
            like_count, models.Post.id == like_count.c.id
        ).order_by(like_count.c.like_count.desc(), models.Post.created_at.desc())
    elif sort == "comments":
        # 댓글 수로 정렬 (서브쿼리 사용)
        comment_count = db.query(
            models.Post.id,
            func.count(models.Comment.id).label("comment_count")
        ).outerjoin(
            models.Comment, models.Comment.post_id == models.Post.id
        ).group_by(models.Post.id).subquery()
        
        query = query.outerjoin(
            comment_count, models.Post.id == comment_count.c.id
        ).order_by(comment_count.c.comment_count.desc(), models.Post.created_at.desc())
    else:  # "recent" (기본값)
        query = query.order_by(models.Post.created_at.desc())
    
    # 총 결과 수 계산
    total_count = query.count()
    
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
            **schemas.Post.model_validate(post).model_dump(),
            "user": schemas.User.model_validate(post.user),
            "institution": schemas.Institution.model_validate(post.institution) if post.institution else None,
            "category": schemas.Category.model_validate(post.category) if post.category else None,
            "images": [schemas.PostImage.model_validate(image) for image in post.images],
            "comment_count": comment_count,
            "like_count": like_count,
            "dislike_count": dislike_count
        }
        result.append(schemas.PostWithDetails(**post_dict))
    
    # 응답에 메타데이터 추가
    return {
        "items": result,
        "total": total_count,
        "page": skip // limit + 1,
        "limit": limit
    }

# 검색 제안 API 엔드포인트 추가
@router.get("/suggest")#, response_model=List[dict]
def suggest_posts(
    *,
    db: Session = Depends(deps.get_db),
    q: str = Query(None, description="검색어"),
    limit: int = Query(5, description="제안 결과 수"),
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    게시물 제목 검색 제안
    """
    if not q or len(q) < 2:
        return []
    
    query = db.query(models.Post)
    
    # 제목에서 검색어 포함 항목 찾기
    query = query.filter(models.Post.title.ilike(f"%{q}%"))
    
    # 관리자나 중재자가 아니면 숨겨진 게시물 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Post.is_hidden == False)
    
    # 최신순 정렬 및 제한
    query = query.order_by(models.Post.created_at.desc()).limit(limit)
    
    # 간략한 정보만 포함
    suggestions = []
    for post in query.all():
        suggestions.append({
            "id": post.id,
            "title": post.title,
            "username": post.user.username,
            "created_at": post.created_at.isoformat()
        })
    
    return suggestions

@router.get("/{post_id}", response_model=schemas.PostWithDetails)
def read_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
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
    
    # 현재 사용자의 반응 상태 확인 (로그인한 경우만)
    liked_by_me = False
    disliked_by_me = False
    if current_user:
        liked_by_me = db.query(models.Reaction).filter(
            models.Reaction.post_id == post.id,
            models.Reaction.user_id == current_user.id,
            models.Reaction.type == "like"
        ).first() is not None
        
        disliked_by_me = db.query(models.Reaction).filter(
            models.Reaction.post_id == post.id,
            models.Reaction.user_id == current_user.id,
            models.Reaction.type == "dislike"
        ).first() is not None
    
    # PostWithDetails 객체 생성
    post_dict = {
        **schemas.Post.model_validate(post).model_dump(),
        "user": schemas.User.model_validate(post.user),
        "institution": schemas.Institution.model_validate(post.institution) if post.institution else None,
        "category": schemas.Category.model_validate(post.category) if post.category else None,
        "images": [schemas.PostImage.model_validate(image) for image in post.images],
        "comment_count": comment_count,
        "like_count": like_count,
        "dislike_count": dislike_count,
        "liked_by_me": liked_by_me,
        "disliked_by_me": disliked_by_me
    }
    
    return schemas.PostWithDetails(**post_dict)

@router.post("/{post_id}/like", response_model=dict)
def like_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물에 좋아요 추가
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 이미 같은 타입의 반응이 있는지 확인
    existing_reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "like"
    ).first()
    
    # 이미 좋아요가 있으면 409 Conflict 반환
    if existing_reaction:
        raise HTTPException(status_code=409, detail="You already liked this post")
    
    # 반대 반응(싫어요)이 있으면 삭제
    opposite_reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "dislike"
    ).first()
    
    if opposite_reaction:
        db.delete(opposite_reaction)
    
    # 새 좋아요 반응 생성
    reaction = models.Reaction(
        user_id=current_user.id,
        post_id=post_id,
        type="like"
    )
    db.add(reaction)
    db.commit()
    
    # 좋아요 수 계산
    like_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.type == "like"
    ).scalar()
    
    return {"like_count": like_count}


@router.delete("/{post_id}/like", response_model=dict)
def unlike_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물 좋아요 취소
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 좋아요 반응 찾기
    reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "like"
    ).first()
    
    # 좋아요가 없으면 404 반환
    if not reaction:
        raise HTTPException(status_code=404, detail="You haven't liked this post")
    
    # 좋아요 삭제
    db.delete(reaction)
    db.commit()
    
    # 좋아요 수 계산
    like_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.type == "like"
    ).scalar()
    
    return {"like_count": like_count}


@router.post("/{post_id}/dislike", response_model=dict)
def dislike_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물에 싫어요 추가
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 이미 같은 타입의 반응이 있는지 확인
    existing_reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "dislike"
    ).first()
    
    # 이미 싫어요가 있으면 409 Conflict 반환
    if existing_reaction:
        raise HTTPException(status_code=409, detail="You already disliked this post")
    
    # 반대 반응(좋아요)이 있으면 삭제
    opposite_reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "like"
    ).first()
    
    if opposite_reaction:
        db.delete(opposite_reaction)
    
    # 새 싫어요 반응 생성
    reaction = models.Reaction(
        user_id=current_user.id,
        post_id=post_id,
        type="dislike"
    )
    db.add(reaction)
    db.commit()
    
    # 싫어요 수 계산
    dislike_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.type == "dislike"
    ).scalar()
    
    return {"dislike_count": dislike_count}


@router.delete("/{post_id}/dislike", response_model=dict)
def undislike_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물 싫어요 취소
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 싫어요 반응 찾기
    reaction = db.query(models.Reaction).filter(
        models.Reaction.user_id == current_user.id,
        models.Reaction.post_id == post_id,
        models.Reaction.type == "dislike"
    ).first()
    
    # 싫어요가 없으면 404 반환
    if not reaction:
        raise HTTPException(status_code=404, detail="You haven't disliked this post")
    
    # 싫어요 삭제
    db.delete(reaction)
    db.commit()
    
    # 싫어요 수 계산
    dislike_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.post_id == post_id,
        models.Reaction.type == "dislike"
    ).scalar()
    
    return {"dislike_count": dislike_count}

@router.delete("/{post_id}", response_model=dict)
def delete_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물 삭제
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 권한 확인: 작성자 또는 관리자만 삭제 가능
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 게시물 삭제
    db.delete(post)
    db.commit()
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="delete_post",
        description=f"User {current_user.username} deleted post {post_id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return {"success": True}

@router.put("/{post_id}", response_model=schemas.Post)
def update_post(
    *,
    db: Session = Depends(deps.get_db),
    post_id: int,
    post_in: schemas.PostUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    게시물 수정
    """
    # 게시물 존재 확인
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 권한 확인: 작성자 또는 관리자만 수정 가능
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 업데이트할 데이터 준비
    update_data = post_in.model_dump(exclude_unset=True)
    
    # 게시물 업데이트
    for field, value in update_data.items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_post",
        description=f"User {current_user.username} updated post {post_id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return post

@router.get("/liked-by/{user_id}", response_model=List[schemas.PostWithDetails])
def read_liked_posts_by_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 사용자가 좋아요한 게시물 목록 조회
    """
    # 사용자 존재 확인
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 사용자가 좋아요한 게시물 ID 목록 조회
    liked_post_ids = db.query(models.Reaction.post_id).filter(
        models.Reaction.user_id == user_id,
        models.Reaction.type == "like",
        models.Reaction.post_id.isnot(None)  # post_id가 NULL이 아닌 경우만
    ).all()
    
    # ID 목록 추출
    liked_post_ids = [post_id for (post_id,) in liked_post_ids]
    
    # 좋아요한 게시물이 없는 경우 빈 목록 반환
    if not liked_post_ids:
        return []
    
    # 좋아요한 게시물 조회
    query = db.query(models.Post).filter(models.Post.id.in_(liked_post_ids))
    
    # 관리자나 중재자가 아니면 숨겨진 게시물 제외
    if not current_user or (current_user.role != "admin" and current_user.role != "moderator"):
        query = query.filter(models.Post.is_hidden == False)
    
    # 최신순 정렬
    query = query.order_by(models.Post.created_at.desc())
    
    # 페이지네이션
    posts = query.offset(skip).limit(limit).all()
    
    # 추가 정보 포함 (기존 read_posts 함수와 동일한 로직)
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
            **schemas.Post.model_validate(post).model_dump(),
            "user": schemas.User.model_validate(post.user),
            "institution": schemas.Institution.model_validate(post.institution) if post.institution else None,
            "category": schemas.Category.model_validate(post.category) if post.category else None,
            "images": [schemas.PostImage.model_validate(image) for image in post.images],
            "comment_count": comment_count,
            "like_count": like_count,
            "dislike_count": dislike_count
        }
        result.append(schemas.PostWithDetails(**post_dict))
    
    return result