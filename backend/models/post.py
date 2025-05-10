# 게시물 모델
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="SET NULL"))
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    view_count = Column(Integer, default=0)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="posts")
    institution = relationship("Institution", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    images = relationship("PostImage", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="post", cascade="all, delete-orphan")


class PostImage(Base):
    __tablename__ = "post_images"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    post = relationship("Post", back_populates="images")