"use client";
import { useState, useRef, useEffect } from "react";

const API = "https://second-brain-production-1508.up.railway.app/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! Ask me anything about what you've saved. I'll search your knowledge base and answer using your own notes." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleAsk() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error reaching backend. Is it running?" }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)", maxWidth: 720 }}>
      <div className="fade-up">
        <div className="page-label">RAG · Groq · LLaMA</div>
        <div className="page-title">Ask AI</div>
        <div className="page-subtitle">Chat with your personal knowledge base.</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} className="fade-up" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animationDelay: `${i * 0.05}s` }}>
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", marginRight: "0.6rem", marginTop: "0.2rem", flexShrink: 0, color: "var(--accent)" }}>◎</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "0.85rem 1.1rem",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? "linear-gradient(135deg, var(--accent), #7c6af7)" : "var(--glass)",
              backdropFilter: "blur(20px)",
              border: msg.role === "assistant" ? "1px solid var(--glass-border)" : "none",
              color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.65,
              boxShadow: msg.role === "user" ? "0 4px 20px rgba(167,139,250,0.25)" : "none",
            }}>
              {msg.content}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: "0.65rem", paddingTop: "0.65rem", borderTop: "1px solid var(--glass-border)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", marginBottom: "0.3rem", letterSpacing: "0.08em" }}>SOURCES</div>
                  {msg.sources.slice(0, 3).map((s, j) => (
                    <div key={j} style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>· {s.title || "Untitled"}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "var(--accent)" }}>◎</div>
            <div className="card" style={{ padding: "0.75rem 1rem", display: "flex", gap: "4px", alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "bounce 1s ease infinite", animationDelay: `${i * 0.15}s`, opacity: 0.7 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
        <input className="input" placeholder="Ask anything about your saved notes..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAsk()} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={handleAsk} disabled={loading}>{loading ? "..." : "Ask →"}</button>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}