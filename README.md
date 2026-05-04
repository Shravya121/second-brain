# Second Brain 🧠

Your personal AI knowledge base — save notes, ask questions, explore connections.

## Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind
- **Backend**: FastAPI + Python
- **AI/RAG**: LangChain + Groq + ChromaDB
- **Database**: MongoDB Atlas

---

## Setup (one-time)

### 1. MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up free
2. Create project → Build a Database → M0 Free tier
3. Set a username + password
4. Network Access → Add IP → Allow from Anywhere
5. Connect → Drivers → copy the connection string

### 2. Groq API Key
1. Go to [console.groq.com](https://console.groq.com) → sign up free
2. Create an API key

### 3. Backend `.env`
Edit `backend/.env`:
```
GROQ_API_KEY=your_key_here
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
```

---

## Running the App

Open **two terminals** in VS Code (`Ctrl + \``)

### Terminal 1 — Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:3000

---

## Features
- `/dashboard` — Save notes/ideas, view and delete saved items
- `/chat` — Ask questions answered from your knowledge base
- `/graph` — D3 knowledge graph connecting notes via tags
