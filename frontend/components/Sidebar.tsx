"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: "✦" },
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/chat", label: "Ask AI", icon: "◎" },
  { href: "/graph", label: "Graph", icon: "⬡" },
  { href: "/notion", label: "Notion Sync", icon: "↗" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-dot" />
        secondbrain
      </div>
      <div style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", padding: "0 0.75rem 0.5rem", textTransform: "uppercase" }}>
        Navigation
      </div>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? "active" : ""}`}>
          <span style={{ fontSize: "0.9rem", width: 18, textAlign: "center" }}>{l.icon}</span>
          {l.label}
        </Link>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{
        padding: "0.75rem",
        borderRadius: "var(--radius-sm)",
        background: "var(--accent-glow)",
        border: "1px solid rgba(167,139,250,0.15)",
        fontSize: "0.75rem",
        color: "var(--text-2)",
        fontFamily: "var(--font-mono)",
      }}>
        <div style={{ color: "var(--accent)", fontWeight: 600, marginBottom: "0.2rem" }}>● LIVE</div>
        Backend connected
      </div>
    </nav>
  );
}