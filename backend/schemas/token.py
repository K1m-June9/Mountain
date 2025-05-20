from typing import Optional
from pydantic import BaseModel
from backend.schemas.user import User  # User 스키마 임포트

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None  # user 필드 추가


class TokenPayload(BaseModel):
    sub: Optional[int] = None