# 사용자 모델
from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("user", "moderator", "admin"), nullable=False, default="user")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    reports_filed = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter")
    reports_reviewed = relationship("Report", foreign_keys="Report.reviewed_by", back_populates="reviewer")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")