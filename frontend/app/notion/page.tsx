"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface SyncStatus { total_items: number; synced_to_notion: number; unsynced: number; }

export default function NotionPage() {
  const { userId } = useAuth();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [databaseId, setDatabaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => { if (userId) fetchStatus(); }, [userId]);

  async function fetchStatus() {
    try { const res = await fetch(`${API}/notion/status?user_id=${userId}`); setStatus(await res.json()); } catch {}
  }

  async function handlePushAll() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`${API}/notion/push-all?user_id=${userId}`, { method: "POST" });
      const data = await res.json();
      setMessage({ text: `✓ Pushed ${data.pushed} items to Notion.${data.failed > 0 ? ` ${data.failed} failed.` : ""}`, type: "success" });
      fetchStatus();
    } catch { setMessage({ text: "Push failed. Check your NOTION_TOKEN.", type: "error" }); }
    setLoading(false);
  }

  async function handlePull() {
    if (!databaseId.trim()) { setMessage({ text: "Please enter a Database ID.", type: "error" }); return; }
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`${API}/notion/pull`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ database_id: databaseId.trim(), user_id: userId }) });
      const data = await res.json();
      setMessage({ text: `✓ Imported ${data.imported} new pages from Notion.`, type: "success" });
      fetchStatus();
    } catch { setMessage({ text: "Pull failed. Check your Database ID.", type: "error" }); }
    setLoading(false);
  }

  const syncPct = status ? Math.round((status.synced_to_notion / Math.max(status.total_items, 1)) * 100) : 0;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="fade-up">
        <div className="page-label">Integration</div>
        <div className="page-title">Notion Sync</div>
        <div className="page-subtitle">Push your knowledge to Notion, or import Notion pages into your Second Brain.</div>
      </div>

      <div className="card fade-up-1" style={{ marginBottom: "1rem", background: "rgba(248,113,113,0.04)", borderColor: "rgba(248,113,113,0.15)" }}>
        <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", marginBottom: "1.25rem" }}>SYNC STATUS</div>
        <div className="grid-3" style={{ marginBottom: "1.25rem" }}>
          {[
            { label: "Total", value: status?.total_items ?? "—" },
            { label: "Synced", value: status?.synced_to_notion ?? "—" },
            { label: "Pending", value: status?.unsynced ?? "—" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", background: "linear-gradient(135deg, var(--text-1), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--glass)", borderRadius: 999, height: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${syncPct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: "0.4rem" }}>{syncPct}% synced</div>
      </div>

      <div className="card fade-up-2" style={{ marginBottom: "0.75rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>Push → Notion</div>
        <div style={{ fontSize: "0.83rem", color: "var(--text-2)", marginBottom: "1rem" }}>Send all unsynced items to your Notion database as pages.</div>
        <button className="btn btn-primary" onClick={handlePushAll} disabled={loading}>{loading ? "Pushing..." : `Push ${status?.unsynced ?? 0} unsynced →`}</button>
      </div>

      <div className="card fade-up-3" style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>Pull ← Notion</div>
        <div style={{ fontSize: "0.83rem", color: "var(--text-2)", marginBottom: "1rem" }}>Import pages from a Notion database so AI can answer questions about them.</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input className="input" placeholder="Notion Database ID" value={databaseId} onChange={e => setDatabaseId(e.target.value)} style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.82rem" }} />
          <button className="btn btn-ghost" onClick={handlePull} disabled={loading}>{loading ? "..." : "Import ←"}</button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", background: message.type === "success" ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${message.type === "success" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, color: message.type === "success" ? "var(--success)" : "var(--error)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
