"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "@/app/styles/KeyResultsComponent.css";

export default function KeyResults({ ids = [], onSelectionChange }) {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    async function fetchKeyResults() {
      const results = [];
      for (const id of ids) {
        try {
          const res = await fetch(`/api/key-results/${id}`);
          const json = await res.json();
          results.push({ id, ...json.data });
        } catch (e) {
          console.error(`Error loading key result ${id}:`, e);
        }
      }
      setKeyResults(results);
      setLoading(false);
      setSelected([]); // Reset selection on ids change
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

  if (loading) return <p>Loading key results...</p>;
  if (!keyResults.length) return <p>No key results found.</p>;

  return (
    <div className="keyresults-wrapper">
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
            justifyContent: "space-between"
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
          <div className="keyresult-progress" style={{ marginLeft: "1rem" }}>
            {kr.progress ? `${Math.round(kr.progress)}%` : "0%"}
          </div>
        </div>
      ))}
    </div>
  );
}
