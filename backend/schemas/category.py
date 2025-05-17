from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


# API 요청 시 사용되는 데이터 (생성)
class CategoryCreate(CategoryBase):
    pass


# API 요청 시 사용되는 데이터 (업데이트)
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# API 응답 시 사용되는 데이터
class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용