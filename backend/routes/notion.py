from fastapi import APIRouter, HTTPException
from db.models import PushRequest, PullRequest
import httpx
import os
from dotenv import load_dotenv
from db.mongo import get_db
from rag.ingest import ingest_text
from datetime import datetime

load_dotenv()

router = APIRouter()
NOTION_API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

def notion_headers():
    token = os.getenv("NOTION_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="NOTION_TOKEN not set")
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }

@router.post("/notion/push")
async def push_to_notion(req: PushRequest):
    from bson import ObjectId
    db = get_db()
    item = await db["items"].find_one({"_id": ObjectId(req.item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    database_id = os.getenv("NOTION_DATABASE_ID")
    if not database_id:
        raise HTTPException(status_code=500, detail="NOTION_DATABASE_ID not set")

    payload = {
        "parent": {"database_id": database_id},
        "properties": {
            "Name": {"title": [{"text": {"content": item.get("title", "Untitled")[:100]}}]},
            "Tags": {"multi_select": [{"name": t} for t in item.get("tags", [])]},
            "Source": {"rich_text": [{"text": {"content": item.get("source", "") or ""}}]}
        },
        "children": [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": item["content"][:2000]}}]}}]
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(f"{NOTION_API}/pages", json=payload, headers=notion_headers())

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    notion_page_id = res.json().get("id")
    from bson import ObjectId
    await db["items"].update_one({"_id": ObjectId(req.item_id)}, {"$set": {"notion_page_id": notion_page_id, "synced_at": datetime.utcnow()}})
    return {"status": "pushed", "notion_page_id": notion_page_id}

@router.post("/notion/push-all")
async def push_all_to_notion(user_id: str = "default"):
    db = get_db()
    cursor = db["items"].find({"notion_page_id": {"$exists": False}, "user_id": user_id})
    pushed = 0
    failed = 0
    async for item in cursor:
        try:
            req = PushRequest(item_id=str(item["_id"]), user_id=user_id)
            await push_to_notion(req)
            pushed += 1
        except Exception:
            failed += 1
    return {"status": "done", "pushed": pushed, "failed": failed}

@router.post("/notion/pull")
async def pull_from_notion(req: PullRequest):
    db = get_db()
    imported = 0

    async with httpx.AsyncClient() as client:
        res = await client.post(f"{NOTION_API}/databases/{req.database_id}/query", headers=notion_headers(), json={})

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    pages = res.json().get("results", [])

    for page in pages:
        notion_id = page["id"]
        existing = await db["items"].find_one({"notion_page_id": notion_id, "user_id": req.user_id})
        if existing:
            continue

        title = "Untitled"
        name_prop = page.get("properties", {}).get("Name", {})
        if name_prop.get("title"):
            title = name_prop["title"][0]["plain_text"] if name_prop["title"] else "Untitled"

        tags = []
        tags_prop = page.get("properties", {}).get("Tags", {})
        if tags_prop.get("multi_select"):
            tags = [t["name"] for t in tags_prop["multi_select"]]

        async with httpx.AsyncClient() as client:
            blocks_res = await client.get(f"{NOTION_API}/blocks/{notion_id}/children", headers=notion_headers())

        content_parts = []
        if blocks_res.status_code == 200:
            for block in blocks_res.json().get("results", []):
                block_type = block.get("type")
                block_data = block.get(block_type, {})
                rich_text = block_data.get("rich_text", [])
                text = " ".join([t.get("plain_text", "") for t in rich_text])
                if text.strip():
                    content_parts.append(text)

        content = "\n\n".join(content_parts) or title
        doc = {
            "content": content, "title": title, "tags": tags,
            "source": f"notion:{notion_id}", "notion_page_id": notion_id,
            "user_id": req.user_id, "created_at": datetime.utcnow()
        }
        result = await db["items"].insert_one(doc)
        ingest_text(content, {"mongo_id": str(result.inserted_id), "title": title, "tags": ", ".join(tags), "source": f"notion:{notion_id}"}, user_id=req.user_id)
        imported += 1

    return {"status": "done", "imported": imported, "total_pages": len(pages)}

@router.get("/notion/status")
async def notion_status(user_id: str = "default"):
    db = get_db()
    total = await db["items"].count_documents({"user_id": user_id})
    synced = await db["items"].count_documents({"user_id": user_id, "notion_page_id": {"$exists": True}})
    return {"total_items": total, "synced_to_notion": synced, "unsynced": total - synced}
