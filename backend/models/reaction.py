from sqlalchemy import Column, Integer, Enum, DateTime, ForeignKey, UniqueConstraint, func, CheckConstraint
from sqlalchemy.orm import relationship

from backend.database import Base


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"))
    type = Column(Enum("like", "dislike"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="reactions")
    post = relationship("Post", back_populates="reactions")
    comment = relationship("Comment", back_populates="reactions")

    # Constraints
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", "type", name="unique_post_reaction"),
        UniqueConstraint("user_id", "comment_id", "type", name="unique_comment_reaction"),
        CheckConstraint("(post_id IS NULL AND comment_id IS NOT NULL) OR (post_id IS NOT NULL AND comment_id IS NULL)",
                        name="check_reaction_target"),
    )