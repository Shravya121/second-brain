"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Graph() {
  const { userId } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState("Loading graph...");

  useEffect(() => {
    if (!userId) return;
    async function loadGraph() {
      try {
        const res = await fetch(`${API}/graph?user_id=${userId}`);
        const { nodes, edges } = await res.json();
        if (nodes.length === 0) { setStatus("No items saved yet. Add some notes in Dashboard first!"); return; }
        setStatus("");
        drawGraph(nodes, edges);
      } catch { setStatus("Could not reach backend."); }
    }
    loadGraph();
  }, [userId]);

  function drawGraph(nodes: any[], edges: any[]) {
    if (!svgRef.current) return;
    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current!);
      svg.selectAll("*").remove();
      const width = svgRef.current!.clientWidth;
      const height = svgRef.current!.clientHeight;
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));
      const link = svg.append("g").selectAll("line").data(edges).join("line").attr("stroke", "#22222e").attr("stroke-width", 1.5);
      const node = svg.append("g").selectAll("circle").data(nodes).join("circle")
        .attr("r", (d: any) => d.type === "tag" ? 8 : 12)
        .attr("fill", (d: any) => d.type === "tag" ? "#f87171" : "#1a1a24")
        .attr("stroke", (d: any) => d.type === "tag" ? "rgba(248,113,113,0.5)" : "#33334a")
        .attr("stroke-width", 2)
        .call(d3.drag<SVGCircleElement, any>()
          .on("start", (event: any, d: any) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (event: any, d: any) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event: any, d: any) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }) as any);
      const label = svg.append("g").selectAll("text").data(nodes).join("text")
        .text((d: any) => d.label.length > 20 ? d.label.slice(0, 20) + "..." : d.label)
        .attr("font-size", (d: any) => d.type === "tag" ? "10px" : "11px")
        .attr("fill", "#8888a0").attr("text-anchor", "middle")
        .attr("dy", (d: any) => d.type === "tag" ? -14 : 24).attr("pointer-events", "none");
      simulation.on("tick", () => {
        link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
        label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
      });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
      <div className="fade-up">
        <div className="page-label">Visual Map</div>
        <div className="page-title">Knowledge Graph</div>
        <div className="page-subtitle">See how your notes connect through shared tags.</div>
      </div>
      <div className="card" style={{ flex: 1, position: "relative", overflow: "hidden", padding: 0 }}>
        {status && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.9rem" }}>{status}</div>
        )}
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-3)" }}>
        <span>⬤ <span style={{ color: "var(--accent)" }}>Red = Tag</span></span>
        <span>⬤ <span style={{ color: "var(--text-2)" }}>Dark = Note</span></span>
        <span>· Drag nodes to rearrange</span>
      </div>
    </div>
  );
}
