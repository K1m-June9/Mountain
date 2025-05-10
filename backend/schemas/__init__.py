from backend.schemas.user import User, UserCreate, UserUpdate, UserInDB
from backend.schemas.institution import Institution, InstitutionCreate, InstitutionUpdate
from backend.schemas.category import Category, CategoryCreate, CategoryUpdate
from backend.schemas.post import Post, PostCreate, PostUpdate, PostWithDetails
from backend.schemas.comment import Comment, CommentCreate, CommentUpdate, CommentWithReplies
from backend.schemas.reaction import Reaction, ReactionCreate
from backend.schemas.report import Report, ReportCreate, ReportUpdate
from backend.schemas.notification import Notification, NotificationCreate, NotificationUpdate
from backend.schemas.notice import Notice, NoticeCreate, NoticeUpdate
from backend.schemas.token import Token, TokenPayload
from backend.schemas.setting import Setting, SettingUpdate