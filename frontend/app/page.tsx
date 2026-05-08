"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 640, margin: "3rem auto" }}>
      <div className="fade-up">
        <div className="page-label">Your personal AI knowledge base</div>
        <h1 style={{
          fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em",
          lineHeight: 1.05, marginBottom: "1.25rem",
          background: "linear-gradient(135deg, #f0f0ff 0%, #9228bc 50%, #e7f2f5 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
        }}>
          Everything you learn,<br />always at hand.
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.7 }}>
          Save notes, links, and ideas. Ask questions in plain English.<br />
          Your Second Brain remembers — so you don't have to.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/dashboard" className="btn btn-primary">Open Dashboard →</Link>
          <Link href="/chat" className="btn btn-ghost">Ask AI</Link>
        </div>
      </div>
      <div className="grid-3 fade-up-2" style={{ marginTop: "3rem" }}>
        {[
          { icon: "◈", label: "Save anything", desc: "Notes, URLs, ideas — all searchable instantly.", color: "var(--accent)" },
          { icon: "◎", label: "Ask questions", desc: "Chat with your knowledge using RAG + Groq AI.", color: "var(--accent-2)" },
          { icon: "⬡", label: "See connections", desc: "Knowledge graph connects ideas through tags.", color: "var(--accent-3)" },
        ].map((f) => (
          <div key={f.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem", color: f.color }}>{f.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: "0.3rem", fontSize: "0.875rem" }}>{f.label}</div>
            <div style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
