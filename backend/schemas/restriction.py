from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class RestrictionBase(BaseModel):
    type: str  # "suspend" 또는 "unsuspend"
    reason: str
    duration: Optional[int] = None  # 일 단위, None이면 무기한
    suspended_until: Optional[datetime] = None  # None이면 무기한


# API 요청 시 사용되는 데이터 (생성)
class RestrictionCreate(RestrictionBase):
    user_id: int


# API 응답 시 사용되는 데이터
class Restriction(RestrictionBase):
    id: int
    user_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용