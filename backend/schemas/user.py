from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# 공통 속성
class UserBase(BaseModel):
    username: str
    email: EmailStr
    # UserBase에 status 필드 추가
    status: Optional[str] = "active"
    suspended_until: Optional[datetime] = None


# API 요청 시 사용되는 데이터 (생성)
class UserCreate(UserBase):
    password: str


# API 요청 시 사용되는 데이터 (업데이트)
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None


# API 응답 시 사용되는 데이터
class User(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용


# 데이터베이스에 저장되는 데이터
class UserInDB(User):
    password_hash: str

class UserStatusUpdate(BaseModel):
    status: str
    suspended_until: Optional[datetime] = None
    reason: str
    duration: Optional[int] = None  # 일 단위, None이면 무기한


class UserRoleUpdate(BaseModel):
    role: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# 관리자용 사용자 상세 정보
class AdminUserDetail(User):
    post_count: int
    comment_count: int
    like_count: int
    dislike_count: int
    created_post_count: int
    deleted_post_count: int
    created_comment_count: int
    deleted_comment_count: int
    last_active: Optional[datetime] = None

# 대시보드 통계 정보
class DashboardStats(BaseModel):
    userCount: int
    activeUserCount: int
    postCount: int
    hiddenPostCount: int
    commentCount: int
    hiddenCommentCount: int
    reportCount: int
    pendingReportCount: int
    newUserCount: int
    newPostCount: int
    newCommentCount: int

class UsernameAvailability(BaseModel):
    available: bool
    message: Optional[str] = None