from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps
from backend.core import security
from backend.core.config import settings

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 호환 토큰 로그인, 액세스 토큰 획득
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=user.id,
        action_type="login",
        description=f"User {user.username} logged in",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.User)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    새 사용자 등록
    """
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=user.id,
        action_type="register",
        description=f"User {user.username} registered",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return user