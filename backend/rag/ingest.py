import chromadb
from sentence_transformers import SentenceTransformer
import uuid

chroma_client = chromadb.PersistentClient(path="./chroma_store")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def get_collection(user_id: str = "default"):
    """Each user gets their own ChromaDB collection."""
    safe_id = user_id.replace("|", "_").replace("-", "_")
    return chroma_client.get_or_create_collection(f"second_brain_{safe_id}")

def ingest_text(content: str, metadata: dict = {}, user_id: str = "default") -> str:
    doc_id = str(uuid.uuid4())
    embedding = embedder.encode(content).tolist()
    collection = get_collection(user_id)
    collection.add(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[content],
        metadatas=[metadata]
    )
    return doc_id

def search_similar(query: str, n_results: int = 5, user_id: str = "default") -> list[dict]:
    query_embedding = embedder.encode(query).tolist()
    collection = get_collection(user_id)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    docs = []
    for i, doc in enumerate(results["documents"][0]):
        docs.append({
            "content": doc,
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i]
        })
    return docs
