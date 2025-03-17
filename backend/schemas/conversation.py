from pydantic import BaseModel
from datetime import datetime
from .message import MessageResponse


class ConversationResponse(BaseModel):
    id: str
    personality: str
    created_at: datetime
    messages: list[MessageResponse]


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
    total: int
    page: int
    page_size: int
