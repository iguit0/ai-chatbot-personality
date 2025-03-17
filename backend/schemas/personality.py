from pydantic import BaseModel
from models.personality import Personality


class PersonalityResponse(BaseModel):
    personalities: list[Personality]
