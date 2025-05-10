# 커스텀 예외 클래스
"""커스텀 예외 클래스"""
"""
현재 구현에서는 FastAPI의 기본 예외처리 사용
아래는 향후 확장성을 생각해서 임의로 일단 생성
"""
from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """리소스를 찾을 수 없을 때 발생하는 예외"""
    
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class PermissionDeniedError(HTTPException):
    """권한이 없을 때 발생하는 예외"""
    
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class BadRequestError(HTTPException):
    """잘못된 요청일 때 발생하는 예외"""
    
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedError(HTTPException):
    """인증되지 않은 사용자일 때 발생하는 예외"""
    
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )