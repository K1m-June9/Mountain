from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from backend.database import Base


class RestrictionHistory(Base):
    __tablename__ = "restriction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum("suspend", "unsuspend"), nullable=False)
    reason = Column(String(255), nullable=False)
    duration = Column(Integer)  # 일 단위, NULL이면 무기한
    suspended_until = Column(DateTime)  # NULL이면 무기한
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="restrictions")
    admin = relationship("User", foreign_keys=[created_by])