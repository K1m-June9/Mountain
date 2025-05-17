from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# 공통 속성
class SettingBase(BaseModel):
    key_name: str
    value: str
    description: Optional[str] = None


# API 요청 시 사용되는 데이터 (업데이트)
class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None


# API 응답 시 사용되는 데이터
class Setting(SettingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True  # orm_mode 대신 from_attributes 사용