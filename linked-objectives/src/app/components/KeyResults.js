"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "@/app/styles/KeyResultsComponent.module.css";

export default function KeyResults({ ids = [], onSelectionChange }) {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!Array.isArray(ids) || ids.length === 0) {
      setKeyResults([]);
      setSelected([]);
      setLoading(false);
      return;
    }

    async function fetchKeyResults() {
      setLoading(true);
      const results = [];

      for (const id of ids) {
        try {
          const res = await fetch(`/api/key-results/${id}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache",
            },
          });
          const json = await res.json();
          if (json?.data) {
            results.push({ id, ...json.data });
          }
        } catch (e) {
          console.error(`Error loading key result ${id}:`, e);
        }
      }

      setKeyResults(results);
      setSelected([]);
      setLoading(false);
    }

    fetchKeyResults();
  }, [ids]);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selected);
  }, [selected, onSelectionChange]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!mounted) return null;

  if (loading) {
    return <div style={{ minHeight: "120px", padding: "1rem" }}>Loading key results...</div>;
  }

  if (!keyResults.length) {
    return <div style={{ minHeight: "120px", padding: "1rem", color: "#777" }}>No key results found.</div>;
  }

  return (
    <div className="keyresults-wrapper" style={{ minHeight: "120px" }}>
      {keyResults.map((kr) => (
        <div
          key={kr.id}
          className={`keyresult-card${selected.includes(kr.id) ? " selected" : ""}`}
          style={{
            border: selected.includes(kr.id)
              ? "2px solid #2563eb"
              : "1px solid #e5e7eb",
            background: selected.includes(kr.id) ? "#e0e7ff" : "#fff",
            transition: "background 0.2s, border 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(kr.id)}
            onChange={() => toggleSelect(kr.id)}
            style={{ marginRight: "1rem" }}
          />
          <div style={{ flex: 1 }}>
            <Link href={`/key-results/${kr.id}`} className="keyresult-title">
              {kr.title}
            </Link>
            <p className="keyresult-comment">
              {kr.comment || "No comment available."}
            </p>
          </div>
          <div
            className="keyresult-state-progress"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              marginLeft: "1rem",
            }}
          >
            <span
              className="keyresult-state"
              style={{
                fontWeight: 600,
                color: "#555",
                marginBottom: "0.2rem",
              }}
            >
              {kr.state || "-"}
            </span>
            <span
              className="keyresult-progress"
              style={{ color: "#2563eb", fontWeight: "bold" }}
            >
              {typeof kr.progress === "number" ? `${Math.round(kr.progress)}%` : "0%"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
