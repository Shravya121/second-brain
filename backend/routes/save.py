from fastapi import APIRouter
from db.models import SaveItemRequest
from db.mongo import get_db
from rag.ingest import ingest_text
from datetime import datetime

router = APIRouter()

@router.post("/save")
async def save_item(item: SaveItemRequest):
    db = get_db()
    doc = {
        "content": item.content,
        "title": item.title or item.content[:60],
        "tags": item.tags,
        "source": item.source,
        "user_id": item.user_id,
        "created_at": datetime.utcnow()
    }
    result = await db["items"].insert_one(doc)
    metadata = {
        "mongo_id": str(result.inserted_id),
        "title": doc["title"],
        "tags": ", ".join(item.tags),
        "source": item.source or "",
        "user_id": item.user_id
    }
    ingest_text(item.content, metadata, user_id=item.user_id)
    return {"status": "saved", "id": str(result.inserted_id)}

@router.get("/items")
async def get_items(user_id: str = "default", limit: int = 50):
    db = get_db()
    cursor = db["items"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items

@router.delete("/items/{item_id}")
async def delete_item(item_id: str):
    from bson import ObjectId
    db = get_db()
    await db["items"].delete_one({"_id": ObjectId(item_id)})
    return {"status": "deleted"}
