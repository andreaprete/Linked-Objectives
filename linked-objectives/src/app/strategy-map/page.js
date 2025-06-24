"use client";
import React, { useEffect, useState, useRef } from "react";
import "@excalidraw/excalidraw/index.css";
import AppLayout from "@/app/components/AppLayout";
import OkrSidebar from "@/app/components/OkrSidebar";
import ExcalidrawWithRef from "./ExcalidrawWithRef";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

const LOCAL_STORAGE_KEY = "strategy-map-scene";

export default function StrategyMapPage() {
  const excalidrawAPIRef = useRef(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const inserted = useRef({}); // Track inserted OKRs and positions

  const [popupRelations, setPopupRelations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/objectiveslist")
      .then((res) => res.json())
      .then(setOkrs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInsertOkr = (okr) => {
    const api = excalidrawAPIRef.current;
    if (!api) return;

    const insertedMap = inserted.current;
    if (insertedMap[okr.id]) return;

    const count = Object.keys(insertedMap).length;
    const x = 100 + (count % 3) * 260;
    const y = 100 + Math.floor(count / 3) * 120;

    insertedMap[okr.id] = { x, y, id: `okr-${okr.id}` };

    const box = convertToExcalidrawElements(
      [
        {
          id: `okr-${okr.id}`,
          type: "rectangle",
          x,
          y,
          width: 240,
          height: 60,
          backgroundColor: "#c0eb75",
          strokeWidth: 2,
          strokeColor: "#000000",
          label: {
            text: okr.title,
            fontSize: 16,
            strokeColor: "#000000",
            textAlign: "center",
            verticalAlign: "middle",
          },
        },
      ],
      { regenerateIds: false }
    );

    api.updateScene({ elements: [...api.getSceneElements(), ...box] });

    // Save current state to localStorage
    const scene = api.getSceneElements();
    const appState = api.getAppState();
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ elements: scene, appState })
    );

    // Helper to resolve OKR title from ID
    const getTitleById = (id) =>
      okrs.find((o) => o.id === id)?.title || `[Unknown: ${id}]`;

    const related = new Set(); // To avoid duplicates
    const suggestions = [];

    // 1. Relationships where current OKR is the source
    for (const rel of [
      ...(okr.contributesTo || []).map((to) => ({
        type: "contributes to",
        sourceId: okr.id,
        targetId: to,
      })),
      ...(okr.needs || []).map((to) => ({
        type: "needs",
        sourceId: okr.id,
        targetId: to,
      })),
    ]) {
      if (inserted.current[rel.targetId]) {
        const key = `${rel.sourceId}-${rel.targetId}-${rel.type}`;
        if (!related.has(key)) {
          related.add(key);
          suggestions.push({
            type: rel.type,
            source: getTitleById(rel.sourceId),
            target: getTitleById(rel.targetId),
          });
        }
      }
    }

    // 2. Relationships where current OKR is the target
    for (const other of okrs) {
      if (inserted.current[other.id]) {
        if (other.contributesTo?.includes(okr.id)) {
          const key = `${other.id}-${okr.id}-contributed by`;
          if (!related.has(key)) {
            related.add(key);
            suggestions.push({
              type: "contributed by",
              source: getTitleById(other.id),
              target: getTitleById(okr.id),
            });
          }
        }
        if (other.needs?.includes(okr.id)) {
          const key = `${other.id}-${okr.id}-needed by`;
          if (!related.has(key)) {
            related.add(key);
            suggestions.push({
              type: "needed by",
              source: getTitleById(other.id),
              target: getTitleById(okr.id),
            });
          }
        }
      }
    }

    // If any relationships found, show popup
    if (suggestions.length > 0) {
      setPopupRelations(suggestions);
      setShowPopup(true);
    }
  };

  return (
    <AppLayout>
      {loading ? (
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Strategy Map...</p>
          </div>
        </main>
      ) : (
        <div
          style={{
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: "1rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              + New Canvas
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "1rem",
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, minHeight: 0 }}>
              <ExcalidrawWithRef
                onApiReady={(api) => {
                  excalidrawAPIRef.current = api;

                  // Load saved state if available
                  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                  if (saved) {
                    try {
                      const { elements, appState } = JSON.parse(saved);
                      api.updateScene({ elements, appState });
                    } catch (err) {
                      console.error("Failed to load saved strategy map:", err);
                    }
                  }
                }}
              />
            </div>
            <OkrSidebar okrs={okrs} onOkrClick={handleInsertOkr} />
          </div>

          {/* Light Popup: Suggested Relationships */}
          {showPopup && (
            <div className="fixed bottom-6 right-6 z-50 w-[360px] bg-white border border-gray-200 shadow-lg rounded-lg p-4">
              <h2 className="text-md font-semibold mb-2">
                Suggested Relationships
              </h2>
              <ul className="space-y-1 text-sm mb-3 max-h-48 overflow-y-auto">
                {popupRelations.map((r, i) => (
                  <li key={i} className="text-gray-700 leading-snug">
                    <strong>{r.source}</strong> <em>{r.type}</em>{" "}
                    <strong>{r.target}</strong>
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Got it, I'll draw them myself
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Modal for New Canvas */}
          {showResetConfirm && (
            <div className="absolute top-0 left-0 w-full h-full z-10 bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">
                  Start New Canvas?
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  This will erase your current canvas. Make sure you've saved or
                  exported it first.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-1 border rounded hover:bg-gray-100"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      localStorage.removeItem(LOCAL_STORAGE_KEY);
                      window.location.reload();
                    }}
                  >
                    Go for it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
