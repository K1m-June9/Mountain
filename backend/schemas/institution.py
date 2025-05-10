from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class InstitutionBase(BaseModel):
    name: str
    description: Optional[str] = None


# API 요청 시 사용되는 데이터 (생성)
class InstitutionCreate(InstitutionBase):
    pass


# API 요청 시 사용되는 데이터 (업데이트)
class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# API 응답 시 사용되는 데이터
class Institution(InstitutionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True