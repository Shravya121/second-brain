from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import save, ask, graph, notion
from db.mongo import connect_db

app = FastAPI(title="Second Brain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()

app.include_router(save.router, prefix="/api")
app.include_router(ask.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(notion.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Second Brain API running"}