from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# 공통 속성
class UserBase(BaseModel):
    username: str
    email: EmailStr


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
        orm_mode = True


# 데이터베이스에 저장되는 데이터
class UserInDB(User):
    password_hash: str