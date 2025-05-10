from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from backend.schemas.user import User


# 공통 속성
class NoticeBase(BaseModel):
    title: str
    content: str
    is_important: Optional[bool] = False


# API 요청 시 사용되는 데이터 (생성)
class NoticeCreate(NoticeBase):
    pass


# API 요청 시 사용되는 데이터 (업데이트)
class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_important: Optional[bool] = None


# API 응답 시 사용되는 데이터
class Notice(NoticeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# 작성자 정보가 포함된 공지사항
class NoticeWithUser(Notice):
    user: User