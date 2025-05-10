# 댓글 모델
from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"))
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
    reactions = relationship("Reaction", back_populates="comment", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="comment", cascade="all, delete-orphan")