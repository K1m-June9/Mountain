from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class NotificationBase(BaseModel):
    type: str
    content: str
    related_id: Optional[int] = None


# API 요청 시 사용되는 데이터 (생성)
class NotificationCreate(NotificationBase):
    user_id: int


# API 요청 시 사용되는 데이터 (업데이트)
class NotificationUpdate(BaseModel):
    is_read: bool = True


# API 응답 시 사용되는 데이터
class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True