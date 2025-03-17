from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import cohere
import os
from dotenv import load_dotenv
from typing import Dict, List

load_dotenv()

app = FastAPI(
    title="Cohere Personality Profiles API",
    description="API for Custom Personality Profiles with Cohere integration",
    version="1.0.0",
)

# Enable CORS to allow frontend communication (e.g., from localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Cohere client with API key from environment variable
cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    raise ValueError("COHERE_API_KEY environment variable is not set")
co = cohere.ClientV2(api_key=cohere_api_key)

cohere_model = os.getenv("COHERE_MODEL", "command-light")


class PersonalityModel(BaseModel):
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


# Define personality traits with enhanced parameters
personalities: Dict[str, PersonalityModel] = {
    "formal_teacher": PersonalityModel(
        id="formal_teacher",
        name="Formal Teacher",
        description="Educational and informative with a formal tone",
        system_prompt="You are a knowledgeable teacher with expertise in various subjects. Provide clear, educational responses with a formal tone. Focus on accuracy and depth of information.",
        tone=3,
        verbosity=7,
        creativity=4,
        formality=8,
        model_params={"temperature": 0.5},
    ),
    "creative_storyteller": PersonalityModel(
        id="creative_storyteller",
        name="Creative Storyteller",
        description="Imaginative and engaging with a narrative style",
        system_prompt="You are a creative storyteller with a vivid imagination. Craft engaging narratives and use colorful language. Feel free to be metaphorical and descriptive.",
        tone=7,
        verbosity=8,
        creativity=9,
        formality=4,
        model_params={"temperature": 1.0},
    ),
    "tech_expert": PersonalityModel(
        id="tech_expert",
        name="Technical Expert",
        description="Precise technical explanations with code examples",
        system_prompt="You are a technical expert who provides precise, detailed explanations with relevant code examples when appropriate. Focus on accuracy and best practices.",
        tone=5,
        verbosity=6,
        creativity=3,
        formality=7,
        model_params={"temperature": 0.3},
    ),
}


class ChatRequest(BaseModel):
    message: str
    personality: str


class PersonalityResponse(BaseModel):
    personalities: List[PersonalityModel]


@app.get("/personalities", response_model=PersonalityResponse)
def get_personalities():
    """Return the list of available personalities with their full configuration."""
    return PersonalityResponse(personalities=list(personalities.values()))


@app.post("/chat", response_model=Dict[str, str])
async def chat(request: ChatRequest):
    """
    Handle chat requests by applying the selected personality to the Cohere response.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if request.personality not in personalities:
        raise HTTPException(status_code=400, detail="Invalid personality selected")

    personality = personalities[request.personality]

    try:
        # Combine system prompt with personality parameters for more nuanced responses
        effective_prompt = f"{personality.system_prompt}\n\nTone: {personality.tone}/10 (higher is more friendly)\nVerbosity: {personality.verbosity}/10 (higher is more detailed)\nCreativity: {personality.creativity}/10 (higher is more creative)\nFormality: {personality.formality}/10 (higher is more formal)"

        response = co.chat(
            model=cohere_model,
            messages=[
                {"role": "system", "content": effective_prompt},
                {"role": "user", "content": request.message},
            ],
            temperature=personality.model_params["temperature"],
        )

        # V2 API: Access response content through message.content[0].text
        generated_text = response.message.content[0].text.strip()

        if not generated_text:
            raise HTTPException(status_code=500, detail="Empty response from Cohere")

        return {"response": generated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}") from e


# Run the app with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
