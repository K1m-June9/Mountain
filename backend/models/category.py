from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship

from backend.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    posts = relationship("Post", back_populates="category")