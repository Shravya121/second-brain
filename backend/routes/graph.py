from fastapi import APIRouter
from db.mongo import get_db
from collections import defaultdict

router = APIRouter()

@router.get("/graph")
async def get_graph(user_id: str = "default"):
    db = get_db()
    cursor = db["items"].find({"user_id": user_id}, {"title": 1, "tags": 1, "_id": 1})
    nodes = []
    edges = []
    tag_map = defaultdict(list)

    async for doc in cursor:
        item_id = str(doc["_id"])
        nodes.append({"id": item_id, "label": doc.get("title", "Untitled"), "type": "item"})
        for tag in doc.get("tags", []):
            tag_map[tag].append(item_id)

    for tag, item_ids in tag_map.items():
        tag_node_id = f"tag:{tag}"
        nodes.append({"id": tag_node_id, "label": tag, "type": "tag"})
        for item_id in item_ids:
            edges.append({"source": item_id, "target": tag_node_id})

    return {"nodes": nodes, "edges": edges}
