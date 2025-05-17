from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from backend.schemas.user import User
from backend.schemas.institution import Institution
from backend.schemas.category import Category


# 이미지 스키마
class PostImageBase(BaseModel):
    image_url: str


class PostImage(PostImageBase):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용


# 공통 속성
class PostBase(BaseModel):
    title: str
    content: str
    institution_id: Optional[int] = None
    category_id: Optional[int] = None


# API 요청 시 사용되는 데이터 (생성)
class PostCreate(PostBase):
    pass


# API 요청 시 사용되는 데이터 (업데이트)
class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    institution_id: Optional[int] = None
    category_id: Optional[int] = None
    is_hidden: Optional[bool] = None


# API 응답 시 사용되는 데이터
class Post(PostBase):
    id: int
    user_id: int
    view_count: int
    is_hidden: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용


# 상세 정보가 포함된 게시물
class PostWithDetails(Post):
    user: User
    institution: Optional[Institution] = None
    category: Optional[Category] = None
    images: List[PostImage] = []
    comment_count: int = 0
    like_count: int = 0
    dislike_count: int = 0