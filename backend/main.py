from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cohere
import os
from dotenv import load_dotenv
from typing import Dict

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
co = cohere.Client(api_key=cohere_api_key)

# TODO: Define personality traits (could be moved to a JSON file for scalability)
personalities: Dict[str, Dict[str, any]] = {
    "formal": {
        "preamble": "Respond in a formal manner.",
        "model_params": {"temperature": 0.5},
    },
    "creative": {
        "preamble": "Use imaginative and descriptive language.",
        "model_params": {"temperature": 1.0},
    },
    "technical": {
        "preamble": "Focus on precise, technical details.",
        "model_params": {"temperature": 0.3},
    },
}


# Pydantic model for chat request validation
class ChatRequest(BaseModel):
    message: str
    personality: str


@app.get("/personalities", response_model=Dict[str, list[str]])
def get_personalities():
    """Return the list of available personalities."""
    return {"personalities": list(personalities.keys())}


@app.post("/chat", response_model=Dict[str, str])
async def chat(request: ChatRequest):
    """
    Handle chat requests by applying the selected personality to the Cohere response.

    Args:
        request: ChatRequest object containing user message and personality.

    Returns:
        Dictionary with the AI's response.

    Raises:
        HTTPException: If personality is invalid, message is empty, or Cohere API fails.
    """
    # Check if message is empty
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Validate personality
    if request.personality not in personalities:
        raise HTTPException(status_code=400, detail="Invalid personality selected")

    # Get personality configuration
    personality = personalities[request.personality]
    preamble = personality["preamble"]
    model_params = personality["model_params"]

    try:
        # Call Cohere API chat method
        response = co.chat(
            message=request.message,
            preamble=preamble,
            model="command-light",
            temperature=model_params["temperature"],
            max_tokens=200,
            stop_sequences=["\n\n"],  # Stop at logical breaks
        )
        generated_text = response.text.strip()

        # Check if response is empty or invalid
        if not generated_text:
            raise HTTPException(status_code=500, detail="Empty response from Cohere")

        return {"response": generated_text}
    except Exception as e:
        # Catch unexpected errors
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}") from e


# Run the app with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
