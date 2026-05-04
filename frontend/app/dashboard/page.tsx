"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:8000/api";

interface Item {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  created_at: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const res = await fetch(`${API}/items`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await fetch(`${API}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, tags: tags.split(",").map(t => t.trim()).filter(Boolean), source: "manual" }),
    });
    setContent(""); setTags(""); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    await fetch(`${API}/items/${id}`, { method: "DELETE" });
    setItems(items.filter(i => i._id !== id));
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="fade-up">
        <div className="page-label">Knowledge Base</div>
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">{items.length} items saved · Growing every day</div>
      </div>

      <div className="card fade-up-1" style={{ marginBottom: "1.5rem", background: "rgba(167,139,250,0.04)", borderColor: "rgba(167,139,250,0.15)" }}>
        <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent)", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>
          + NEW ENTRY
        </div>
        <textarea className="textarea" rows={4} placeholder="Paste a note, article, idea, or URL..." value={content} onChange={e => setContent(e.target.value)} />
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", alignItems: "center" }}>
          <input className="input" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save →"}</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {loading && <div style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "1rem 0" }}>Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-3)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>◈</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Nothing saved yet. Add something above!</div>
          </div>
        )}
        {items.map((item, i) => (
          <div key={item._id} className="card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: "0.35rem", fontSize: "0.9rem" }}>{item.title}</div>
                <div style={{ color: "var(--text-2)", fontSize: "0.83rem", lineHeight: 1.6 }}>
                  {item.content.length > 180 ? item.content.slice(0, 180) + "..." : item.content}
                </div>
                {item.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                    {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(item._id)}
                style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "1.2rem", padding: "0.2rem", lineHeight: 1, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--error)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}