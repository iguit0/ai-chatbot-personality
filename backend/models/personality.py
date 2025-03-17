from pydantic import BaseModel, Field
from typing import Dict


class Personality(BaseModel):
    id: str
    name: str
    description: str = Field(..., max_length=200)
    system_prompt: str = Field(..., max_length=500)
    tone: int = Field(..., ge=1, le=10)
    verbosity: int = Field(..., ge=1, le=10)
    creativity: int = Field(..., ge=1, le=10)
    formality: int = Field(..., ge=1, le=10)
    is_default: bool = True
    model_params: Dict[str, float] = {"temperature": 0.7}
