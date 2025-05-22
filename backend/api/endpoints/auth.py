from datetime import timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps
from backend.core import security
from backend.core.config import settings

router = APIRouter()


# @router.post("/login", response_model=schemas.Token)
# def login_access_token(
#     db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
# ) -> Any:
#     """
#     OAuth2 호환 토큰 로그인, 액세스 토큰 획득
#     """
#     user = db.query(models.User).filter(models.User.username == form_data.username).first()
#     if not user or not security.verify_password(form_data.password, user.password_hash):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     # 활동 로그 기록
#     activity_log = models.ActivityLog(
#         user_id=user.id,
#         action_type="login",
#         description=f"User {user.username} logged in",
#         ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
#     )
#     db.add(activity_log)
#     db.commit()
    
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     return {
#         "access_token": security.create_access_token(
#             user.id, expires_delta=access_token_expires
#         ),
#         "token_type": "bearer",
#     }
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
    
    # 사용자 정보를 포함하여 반환
    # 비밀번호 해시와 같은 민감한 정보는 제외
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "suspended_until": user.suspended_until,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user_data  # 사용자 정보 추가
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

# backend/api/endpoints/auth.py에 추가

@router.post("/change-password", response_model=schemas.User)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    password_data: schemas.PasswordChange,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 비밀번호 변경 (현재 비밀번호 검증 포함)
    """
    # 현재 비밀번호 검증
    if not security.verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    
    # 새 비밀번호 유효성 검사 (필요한 경우)
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )
    
    # 비밀번호 업데이트
    current_user.password_hash = security.get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="change_password",
        description=f"User {current_user.username} changed password",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return current_user

@router.get("/check-username", response_model=schemas.UsernameAvailability)
def check_username_availability(
    username: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    사용자명 중복 확인
    """
    # 사용자명 유효성 검사 (선택적)
    if len(username) < 3:
        return {
            "available": False,
            "message": "사용자명은 최소 3자 이상이어야 합니다."
        }
    
    # 데이터베이스에서 사용자명 중복 확인
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if user:
        return {
            "available": False,
            "message": "이미 사용 중인 사용자명입니다."
        }
    
    return {
        "available": True,
        "message": "사용 가능한 사용자명입니다."
    }

@router.post("/logout", response_model=dict)
def logout(
    db: Session = Depends(deps.get_db),
    current_user: Optional[models.User] = Depends(deps.get_optional_current_user)
) -> Any:
    """
    사용자 로그아웃 처리
    """
    # 현재 사용자가 있는 경우에만 활동 로그 기록
    if current_user:
        activity_log = models.ActivityLog(
            user_id=current_user.id,
            action_type="logout",
            description=f"User {current_user.username} logged out",
            ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
        )
        db.add(activity_log)
        db.commit()
    
    # JWT 기반 인증에서는 클라이언트 측에서 토큰을 삭제하는 것이 주요 로그아웃 메커니즘입니다.
    # 서버 측에서는 특별한 작업이 필요하지 않지만, 필요한 경우 토큰 블랙리스트 등을 구현할 수 있습니다.
    
    return {"success": True, "message": "Successfully logged out"}