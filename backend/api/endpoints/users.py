from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps
from backend.core import security

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 목록 조회
    """
    if current_user.role != "admin" and current_user.role != "moderator":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    현재 사용자 정보 조회
    """
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    특정 사용자 정보 조회
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    현재 사용자 정보 업데이트
    """
    if user_in.username is not None:
        user = db.query(models.User).filter(models.User.username == user_in.username).first()
        if user and user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    if user_in.email is not None:
        user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if user and user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # 사용자 정보 업데이트
    if user_in.username is not None:
        current_user.username = user_in.username
    if user_in.email is not None:
        current_user.email = user_in.email
    if user_in.password is not None:
        current_user.password_hash = security.get_password_hash(user_in.password)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_profile",
        description=f"User {current_user.username} updated profile",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return current_user