# 신고 모델
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, func, CheckConstraint
from sqlalchemy.orm import relationship

from backend.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"))
    reason = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(Enum("pending", "reviewed", "resolved", "rejected"), nullable=False, default="pending")
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports_filed")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reports_reviewed")
    post = relationship("Post", back_populates="reports")
    comment = relationship("Comment", back_populates="reports")

    # Constraints
    __table_args__ = (
        CheckConstraint("(post_id IS NULL AND comment_id IS NOT NULL) OR (post_id IS NOT NULL AND comment_id IS NULL)",
                        name="check_report_target"),
    )