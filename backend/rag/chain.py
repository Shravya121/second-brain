from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from rag.ingest import search_similar
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
model_name="llama-3.3-70b-versatile"
)

def answer_question(question: str) -> dict:
    """RAG: retrieve relevant notes then answer with Groq."""
    relevant_docs = search_similar(question, n_results=5)
    
    if not relevant_docs:
        context = "No relevant notes found in the knowledge base yet."
    else:
        context = "\n\n---\n\n".join([d["content"] for d in relevant_docs])

    system_prompt = f"""You are a personal knowledge assistant. The user has saved notes, articles, and ideas into their Second Brain.

Use ONLY the following saved knowledge to answer the question. If the answer isn't in the knowledge base, say so clearly.

KNOWLEDGE BASE:
{context}
"""
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=question)
    ]

    response = llm.invoke(messages)
    
    return {
        "answer": response.content,
        "sources": [d["metadata"] for d in relevant_docs]
    }
