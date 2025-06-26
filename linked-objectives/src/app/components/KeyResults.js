"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";

/* ─ color helper ─ */
const stateColor = (s) => {
  switch (s) {
    case "Draft":
    case "Idea":
    case "Planned":
      return "#3b82f6";
    case "Evaluating":
    case "Approved":
    case "Released":
      return "#8b5cf6";
    case "InProgress":
    case "Completed":
    case "Archived":
      return "#10b981";
    case "Aborted":
    case "Withdrawn":
    case "Rejected":
    case "Cancelled":
      return "#ef4444";
    case "OnHold":
    case "Deprecated":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
};

export default function KeyResults({ ids = [], onSelectionChange }) {
  /* data + selection */
  const [keyResults, setKeyResults] = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [selected,    setSelected]  = useState([]);

  /* filters */
  const [showFilters, setShowFilters] = useState(false);
  const [search,      setSearch]      = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [minPct,      setMinPct]      = useState("");
  const [maxPct,      setMaxPct]      = useState("");

  /* ref for smooth height animation */
  const panelRef = useRef(null);

  /* load KRs */
  useEffect(() => {
    if (!ids.length) { setKeyResults([]); setLoading(false); return; }
    (async () => {
      setLoading(true);
      const res = await Promise.all(ids.map((id) =>
        fetch(`/api/key-results/${id}`, { cache:"no-store" })
          .then(r => r.json())
          .then(j => ({ id, ...j.data, progress: +j.data.progress || 0 }))
          .catch(() => null)
      ));
      setKeyResults(res.filter(Boolean));
      setSelected([]); setLoading(false);
    })();
  }, [ids]);

  /* parent callback */
  useEffect(() => { onSelectionChange?.(selected); }, [selected]);

  /* unique states for dropdown */
  const stateOptions = useMemo(
    () => Array.from(new Set(keyResults.map(k => k.state))).sort(),
    [keyResults]
  );

  /* apply filters */
  const filtered = useMemo(() => {
    return keyResults.filter((k) => {
      const q = search.toLowerCase();
      if (q && !(k.title?.toLowerCase().includes(q) || k.comment?.toLowerCase().includes(q))) return false;
      if (stateFilter !== "ALL" && k.state !== stateFilter) return false;
      if (minPct && k.progress < Number(minPct)) return false;
      if (maxPct && k.progress > Number(maxPct)) return false;
      return true;
    });
  }, [keyResults, search, stateFilter, minPct, maxPct]);

  const toggleSelect = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* animate panel height on open/close */
  useEffect(() => {
    if (!panelRef.current) return;
    const el = panelRef.current;
    if (showFilters) {
      el.style.maxHeight = el.scrollHeight + "px";
    } else {
      el.style.maxHeight = "0px";
    }
  }, [showFilters, keyResults]); // re-run if options change height

  /* ───────── render ───────── */
  if (loading) return <p style={{ padding:"1rem", fontStyle:"italic" }}>Loading key results…</p>;
  if (!keyResults.length) return <p style={{ padding:"1rem", fontStyle:"italic", color:"#888" }}>No key results found.</p>;

  return (
    <div style={{ padding:"1rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
      {/* toggle link */}
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        style={{ alignSelf:"flex-start", background:"none", border:"none",
                 color:"#2563eb", fontWeight:600, cursor:"pointer" }}
      >
        {showFilters ? "Hide filters ▲" : "Show filters ▾"}
      </button>

      {/* filter panel with smooth collapse */}
      <div
        ref={panelRef}
        className="kr-filter-panel"
        style={{
          overflow:"hidden",
          maxHeight:0,
          transition:"max-height .25s ease",
          display:"flex",
          flexWrap:"wrap",
          gap:"0.75rem",
          padding: showFilters ? "0.75rem 1rem" : "0 1rem",
          background:"#f3f4f6",
          borderRadius:"0.5rem"
        }}
      >
        {/* search */}
        <input
          type="text" placeholder="Search title/comment…"
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:"1 1 220px", padding:"0.4rem", border:"1px solid #d1d5db", borderRadius:"0.375rem" }}
        />

        {/* state */}
        <select
          value={stateFilter} onChange={(e)=>setStateFilter(e.target.value)}
          style={{ flex:"0 0 160px", padding:"0.4rem", border:"1px solid #d1d5db", borderRadius:"0.375rem" }}
        >
          <option value="ALL">All states</option>
          {stateOptions.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* progress range */}
        <input type="number" placeholder="Min %" min="0" max="100"
               value={minPct} onChange={e=>setMinPct(e.target.value)}
               style={{ width:"80px", padding:"0.4rem", border:"1px solid #d1d5db", borderRadius:"0.375rem" }}/>
        <span style={{ alignSelf:"center" }}>–</span>
        <input type="number" placeholder="Max %" min="0" max="100"
               value={maxPct} onChange={e=>setMaxPct(e.target.value)}
               style={{ width:"80px", padding:"0.4rem", border:"1px solid #d1d5db", borderRadius:"0.375rem" }}/>
        <button type="button" onClick={()=>{setSearch("");setStateFilter("ALL");setMinPct("");setMaxPct("");}}
                style={{ padding:"0.4rem 0.75rem", background:"#e5e7eb", borderRadius:"0.375rem" }}>
          Reset
        </button>
      </div>

      {/* list */}
      {filtered.map(kr => (
        <div key={kr.id}
          style={{
            display:"flex", gap:"1rem", alignItems:"center",
            border:selected.includes(kr.id) ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background:selected.includes(kr.id) ? "#e0e7ff" : "#fff",
            padding:"1rem", borderRadius:"0.5rem", transition:"all .2s"
          }}
        >
          <input type="checkbox" checked={selected.includes(kr.id)} onChange={()=>toggleSelect(kr.id)}/>
          <div style={{ flexGrow:1, minWidth:0 }}>
            <Link href={`/key-results/${kr.id}`} style={{ fontWeight:600, color:"#1d4ed8", textDecoration:"none" }}>
              {kr.title}
            </Link>
            <p style={{ margin:0, fontSize:"0.9rem", color:"#444" }}>{kr.comment || "No comment available."}</p>
          </div>
          <div style={{ textAlign:"right", minWidth:"85px" }}>
            <span style={{ fontWeight:600, color:stateColor(kr.state) }}>{kr.state}</span><br/>
            <span>{Math.round(kr.progress)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
