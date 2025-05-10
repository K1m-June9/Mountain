from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from backend.schemas.user import User


# 공통 속성
class CommentBase(BaseModel):
    content: str
    post_id: int
    parent_id: Optional[int] = None


# API 요청 시 사용되는 데이터 (생성)
class CommentCreate(CommentBase):
    pass


# API 요청 시 사용되는 데이터 (업데이트)
class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_hidden: Optional[bool] = None


# API 응답 시 사용되는 데이터
class Comment(CommentBase):
    id: int
    user_id: int
    is_hidden: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# 사용자 정보가 포함된 댓글
class CommentWithUser(Comment):
    user: User
    like_count: int = 0
    dislike_count: int = 0


# 답글이 포함된 댓글
class CommentWithReplies(CommentWithUser):
    replies: List['CommentWithUser'] = []