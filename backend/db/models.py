from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SaveItemRequest(BaseModel):
    content: str
    title: Optional[str] = None
    tags: Optional[List[str]] = []
    source: Optional[str] = None
    user_id: Optional[str] = "default"

class AskRequest(BaseModel):
    question: str
    user_id: Optional[str] = "default"

class PushRequest(BaseModel):
    item_id: str
    user_id: Optional[str] = "default"

class PullRequest(BaseModel):
    database_id: str
    user_id: Optional[str] = "default"
