from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class ReactionBase(BaseModel):
    type: str  # "like" 또는 "dislike"


# API 요청 시 사용되는 데이터 (생성)
class ReactionCreate(ReactionBase):
    post_id: int = None
    comment_id: int = None


# API 응답 시 사용되는 데이터
class Reaction(ReactionBase):
    id: int
    user_id: int
    post_id: int = None
    comment_id: int = None
    created_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용