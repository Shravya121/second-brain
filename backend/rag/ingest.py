import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid

# Init ChromaDB (local persistent)
chroma_client = chromadb.PersistentClient(path="./chroma_store")
collection = chroma_client.get_or_create_collection("second_brain")

# Local embedding model (free, no API needed)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def ingest_text(content: str, metadata: dict = {}) -> str:
    """Embed and store a piece of text. Returns the doc_id."""
    doc_id = str(uuid.uuid4())
    embedding = embedder.encode(content).tolist()
    collection.add(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[content],
        metadatas=[metadata]
    )
    return doc_id

def search_similar(query: str, n_results: int = 5) -> list[dict]:
    """Return top-n most relevant chunks for a query."""
    query_embedding = embedder.encode(query).tolist()
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
