from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    personality = Column(String)
