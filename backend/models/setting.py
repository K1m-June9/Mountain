from sqlalchemy import Column, Integer, String, Text, DateTime, func

from backend.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String(50), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())