import uuid
import json
import os
from cohere import ClientV2
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from models.conversation import Conversation
from models.message import Message
from models.personality import Personality
from schemas.personality import PersonalityResponse
from schemas.chat import ChatRequest, ChatResponse
from schemas.conversation import ConversationResponse, ConversationListResponse
from schemas.message import MessageResponse


load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./db/chat.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(
    title="Cohere Personality Profiles API",
    description="API for Custom Personality Profiles with Cohere integration",
    version="1.0.0",
)

# Enable CORS to allow frontend communication (e.g., from localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # TODO: Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Cohere client with API key from environment variable
cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    raise ValueError("COHERE_API_KEY environment variable is not set")
co = ClientV2(api_key=cohere_api_key)

cohere_model = os.getenv("COHERE_MODEL", "command-light")


# Load personalities from JSON file
def load_personalities():
    with open("data/personalities.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        return {p["id"]: Personality(**p) for p in data["personalities"]}


# Load personalities
personalities = load_personalities()


@app.get("/personalities", response_model=PersonalityResponse)
def get_personalities():
    """Return the list of available personalities with their full configuration."""
    return PersonalityResponse(personalities=list(personalities.values()))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Handle chat requests by applying the selected personality to the Cohere response.
    Maintains conversation history in the database.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if request.personality not in personalities:
        raise HTTPException(status_code=400, detail="Invalid personality selected")

    personality = personalities[request.personality]

    # Get or create conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        db_conversation = Conversation(
            id=conversation_id, personality=request.personality
        )
        db.add(db_conversation)
        db.commit()

    # Store user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()

    try:
        # Get conversation history
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .all()
        )

        # Build conversation history for prompt
        conversation_history = ""
        for msg in messages:
            role = "USER" if msg.role == "user" else "ASSISTANT"
            conversation_history += f"{role}: {msg.content}\n"

        # Add personality prompt
        effective_prompt = f"{personality.system_prompt}\n\nTone: {personality.tone}/10 (higher is more friendly)\nVerbosity: {personality.verbosity}/10 (higher is more detailed)\nCreativity: {personality.creativity}/10 (higher is more creative)\nFormality: {personality.formality}/10 (higher is more formal)\n\nConversation History:\n{conversation_history}"

        response = co.chat(
            model=cohere_model,
            messages=[
                {"role": "system", "content": effective_prompt},
                {"role": "user", "content": request.message},
            ],
            temperature=personality.model_params["temperature"],
        )

        generated_text = response.message.content[0].text.strip()

        if not generated_text:
            raise HTTPException(status_code=500, detail="Empty response from Cohere")

        # Store assistant response
        assistant_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=generated_text,
        )
        db.add(assistant_message)
        db.commit()

        return ChatResponse(response=generated_text, conversation_id=conversation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}") from e


@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Fetch a conversation and its messages by ID."""
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )

    return ConversationResponse(
        id=conversation.id,
        personality=conversation.personality,
        created_at=conversation.created_at,
        messages=[
            MessageResponse(
                id=msg.id, role=msg.role, content=msg.content, created_at=msg.created_at
            )
            for msg in messages
        ],
    )


@app.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    """List all conversations with pagination and sorting."""
    if page < 1 or page_size < 1:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters")

    if sort_by not in ["created_at", "personality"]:
        raise HTTPException(status_code=400, detail="Invalid sort field")

    if sort_order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="Invalid sort order")

    # Calculate offset
    offset = (page - 1) * page_size

    # Build query
    query = db.query(Conversation)

    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(getattr(Conversation, sort_by).desc())
    else:
        query = query.order_by(getattr(Conversation, sort_by).asc())

    # Get total count
    total = query.count()

    # Get paginated results
    conversations = query.offset(offset).limit(page_size).all()

    # Get messages for each conversation
    result = []
    for conv in conversations:
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at)
            .all()
        )

        result.append(
            ConversationResponse(
                id=conv.id,
                personality=conv.personality,
                created_at=conv.created_at,
                messages=[
                    MessageResponse(
                        id=msg.id,
                        role=msg.role,
                        content=msg.content,
                        created_at=msg.created_at,
                    )
                    for msg in messages
                ],
            )
        )

    return ConversationListResponse(
        conversations=result, total=total, page=page, page_size=page_size
    )
