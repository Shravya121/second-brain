from fastapi import APIRouter
from db.models import SaveItemRequest
from db.mongo import get_db
from rag.ingest import ingest_text
from datetime import datetime

router = APIRouter()

@router.post("/save")
async def save_item(item: SaveItemRequest):
    db = get_db()
    
    # Store in MongoDB
    doc = {
        "content": item.content,
        "title": item.title or item.content[:60],
        "tags": item.tags,
        "source": item.source,
        "created_at": datetime.utcnow()
    }
    result = await db["items"].insert_one(doc)
    
    # Ingest into ChromaDB for RAG
    metadata = {
        "mongo_id": str(result.inserted_id),
        "title": doc["title"],
        "tags": ", ".join(item.tags),
        "source": item.source or ""
    }
    ingest_text(item.content, metadata)
    
    return {"status": "saved", "id": str(result.inserted_id)}

@router.get("/items")
async def get_items(limit: int = 50):
    db = get_db()
    cursor = db["items"].find().sort("created_at", -1).limit(limit)
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
