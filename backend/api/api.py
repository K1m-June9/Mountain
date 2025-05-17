from fastapi import APIRouter

from backend.api.endpoints import users, auth, posts, comments, institutions, categories, reports, notifications, admin, notices

api_router = APIRouter()

# 각 엔드포인트 모듈의 라우터 포함
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(institutions.router, prefix="/institutions", tags=["institutions"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(notices.router, prefix="/notices", tags=["notices"])