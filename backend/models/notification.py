# 알림 모델
from sqlalchemy import Column, Integer, Text, Enum, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum("report_status", "admin_message"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")