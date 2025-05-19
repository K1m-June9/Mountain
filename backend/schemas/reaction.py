# backend/schemas/reaction.py 수정

from datetime import datetime
from typing import Optional  # Optional 타입 추가
from pydantic import BaseModel


# 공통 속성
class ReactionBase(BaseModel):
    type: str  # "like" 또는 "dislike"


# API 요청 시 사용되는 데이터 (생성)
class ReactionCreate(ReactionBase):
    post_id: Optional[int] = None  # Optional[int]로 변경
    comment_id: Optional[int] = None  # Optional[int]로 변경


# API 응답 시 사용되는 데이터
class Reaction(ReactionBase):
    id: int
    user_id: int
    post_id: Optional[int] = None  # Optional[int]로 변경
    comment_id: Optional[int] = None  # Optional[int]로 변경
    created_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용