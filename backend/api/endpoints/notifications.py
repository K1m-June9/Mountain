from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    현재 사용자의 알림 목록 조회
    """
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(
        models.Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return notifications


@router.put("/{notification_id}/read", response_model=schemas.Notification)
def mark_notification_as_read(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    알림을 읽음 상태로 표시
    """
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


@router.put("/read-all", response_model=List[schemas.Notification])
def mark_all_notifications_as_read(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    모든 알림을 읽음 상태로 표시
    """
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).all()
    
    for notification in notifications:
        notification.is_read = True
        db.add(notification)
    
    db.commit()
    
    # 업데이트된 알림 목록 반환
    updated_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(
        models.Notification.created_at.desc()
    ).all()
    
    return updated_notifications


@router.delete("/{notification_id}", response_model=schemas.Notification)
def delete_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    알림 삭제
    """
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return notification

@router.get("/unread-count", response_model=dict)
def get_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    읽지 않은 알림 개수 조회
    """
    count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).count()
    
    return {"count": count}