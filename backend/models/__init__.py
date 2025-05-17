from backend.database import Base
from backend.models.user import User
from backend.models.institution import Institution
from backend.models.category import Category
from backend.models.post import Post, PostImage
from backend.models.comment import Comment
from backend.models.reaction import Reaction
from backend.models.report import Report
from backend.models.notification import Notification
from backend.models.notice import Notice
from backend.models.activity_log import ActivityLog
from backend.models.setting import Setting
from backend.models.restriction_history import RestrictionHistory
#데이터베이스 스키마를 정의하는 역할
# 모든 모델을 여기에 나열하여 alembic이 감지할 수 있도록 합니다
__all__ = [
    "Base",
    "User",
    "Institution",
    "Category",
    "Post",
    "PostImage",
    "Comment",
    "Reaction",
    "Report",
    "Notification",
    "Notice",
    "ActivityLog",
    "Setting",
    "RestrictionHistory"
]