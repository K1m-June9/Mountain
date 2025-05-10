from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.NoticeWithUser])
def read_notices(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    important_only: bool = False,
) -> Any:
    """
    공지사항 목록 조회
    """
    query = db.query(models.Notice)
    
    # 중요 공지사항만 필터링
    if important_only:
        query = query.filter(models.Notice.is_important == True)
    
    # 최신순 정렬 (중요 공지사항 우선)
    query = query.order_by(models.Notice.is_important.desc(), models.Notice.created_at.desc())
    
    # 페이지네이션
    notices = query.offset(skip).limit(limit).all()
    
    # 작성자 정보 포함
    result = []
    for notice in notices:
        notice_dict = {
            **schemas.Notice.from_orm(notice).dict(),
            "user": schemas.User.from_orm(notice.user)
        }
        result.append(schemas.NoticeWithUser(**notice_dict))
    
    return result


@router.post("/", response_model=schemas.Notice)
def create_notice(
    *,
    db: Session = Depends(deps.get_db),
    notice_in: schemas.NoticeCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    새 공지사항 생성 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    notice = models.Notice(
        **notice_in.dict(),
        user_id=current_user.id
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="create_notice",
        description=f"Admin {current_user.username} created notice {notice.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return notice


@router.get("/{notice_id}", response_model=schemas.NoticeWithUser)
def read_notice(
    notice_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    특정 공지사항 조회
    """
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    # 작성자 정보 포함
    notice_dict = {
        **schemas.Notice.from_orm(notice).dict(),
        "user": schemas.User.from_orm(notice.user)
    }
    
    return schemas.NoticeWithUser(**notice_dict)


@router.put("/{notice_id}", response_model=schemas.Notice)
def update_notice(
    *,
    db: Session = Depends(deps.get_db),
    notice_id: int,
    notice_in: schemas.NoticeUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    공지사항 수정 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    # 공지사항 정보 업데이트
    if notice_in.title is not None:
        notice.title = notice_in.title
    if notice_in.content is not None:
        notice.content = notice_in.content
    if notice_in.is_important is not None:
        notice.is_important = notice_in.is_important
    
    db.add(notice)
    db.commit()
    db.refresh(notice)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_notice",
        description=f"Admin {current_user.username} updated notice {notice.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return notice


@router.delete("/{notice_id}", response_model=schemas.Notice)
def delete_notice(
    *,
    db: Session = Depends(deps.get_db),
    notice_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    공지사항 삭제 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="delete_notice",
        description=f"Admin {current_user.username} deleted notice {notice.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    
    # 공지사항 삭제
    db.delete(notice)
    db.commit()
    
    return notice