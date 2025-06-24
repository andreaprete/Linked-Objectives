"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function KeyResults({ ids = [], onSelectionChange }) {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

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
            const progressVal = parseFloat(json.data.progress);
            results.push({
              id,
              ...json.data,
              progress: isNaN(progressVal) ? 0 : progressVal,
            });
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

  if (loading) {
    return (
      <div style={{ padding: "1rem", fontStyle: "italic", color: "#555" }}>
        Loading key results...
      </div>
    );
  }

  if (!keyResults.length) {
    return (
      <div style={{ padding: "1rem", fontStyle: "italic", color: "#888" }}>
        No key results found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {keyResults.map((kr) => (
        <div
          key={kr.id}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            border: selected.includes(kr.id)
              ? "2px solid #2563eb"
              : "1px solid #e5e7eb",
            backgroundColor: selected.includes(kr.id) ? "#e0e7ff" : "#fff",
            padding: "1rem",
            borderRadius: "0.5rem",
            transition: "all 0.2s ease-in-out",
            width: "100%",
            gap: "1rem",
          }}
        >
          {/* ⬅ Checkbox */}
          <div style={{ flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={selected.includes(kr.id)}
              onChange={() => toggleSelect(kr.id)}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* 🧠 Main content (title + comment) */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <Link
              href={`/key-results/${kr.id}`}
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                textDecoration: "none",
                color: "#1d4ed8",
                display: "block",
                marginBottom: "0.3rem",
                wordBreak: "break-word",
              }}
            >
              {kr.title}
            </Link>
            <p style={{ margin: 0, color: "#444", wordBreak: "break-word" }}>
              {kr.comment || "No comment available."}
            </p>
          </div>

          {/* ➡ Right metadata */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexShrink: 0,
              marginLeft: "1rem",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "#555",
                marginBottom: "0.2rem",
              }}
            >
              {kr.state || "-"}
            </span>
            <span style={{ color: "#222" }}>
              {`${Math.round(kr.progress)}%`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
