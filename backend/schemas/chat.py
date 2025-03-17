from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    personality: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
