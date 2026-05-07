from fastapi import APIRouter
from db.models import AskRequest
from rag.chain import answer_question

router = APIRouter()

@router.post("/ask")
async def ask(req: AskRequest):
    result = answer_question(req.question, user_id=req.user_id)
    return result
