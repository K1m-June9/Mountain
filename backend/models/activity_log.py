from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False, index=True)
    description = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="activity_logs")