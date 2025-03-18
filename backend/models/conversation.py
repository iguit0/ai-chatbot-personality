from sqlalchemy import Column, String, DateTime
from datetime import datetime
from .base import Base


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    personality = Column(String)
