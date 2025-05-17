from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class ReportBase(BaseModel):
    reason: str
    description: Optional[str] = None


# API 요청 시 사용되는 데이터 (생성)
class ReportCreate(ReportBase):
    post_id: Optional[int] = None
    comment_id: Optional[int] = None


# API 요청 시 사용되는 데이터 (업데이트)
class ReportUpdate(BaseModel):
    status: str
    reviewed_by: int


# API 응답 시 사용되는 데이터
class Report(ReportBase):
    id: int
    reporter_id: int
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    status: str
    reviewed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용