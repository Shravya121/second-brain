from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SaveItemRequest(BaseModel):
    content: str
    title: Optional[str] = None
    tags: Optional[List[str]] = []
    source: Optional[str] = None  # url or "manual"

class SavedItem(BaseModel):
    id: Optional[str] = None
    content: str
    title: Optional[str] = None
    tags: List[str] = []
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AskRequest(BaseModel):
    question: str
