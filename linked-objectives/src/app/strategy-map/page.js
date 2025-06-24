"use client";
import React, { useEffect, useState, useRef } from "react";
import "@excalidraw/excalidraw/index.css";
import AppLayout from "@/app/components/AppLayout";
import OkrSidebar from "@/app/components/OkrSidebar";
import ExcalidrawWithRef from "./ExcalidrawWithRef";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

export default function StrategyMapPage() {
  const excalidrawAPIRef = useRef(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const inserted = useRef({}); // Track inserted OKRs and positions

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
  };

  const handleConnectRelationships = () => {
    const api = excalidrawAPIRef.current;
    if (!api) return;

    const allArrows = [];

    for (const okr of okrs) {
      const relations = [
        ...(okr.contributesTo || []).map((to) => ({
          from: okr.id,
          to,
          label: "contributes to",
        })),
        ...(okr.contributedToBy || []).map((from) => ({
          from,
          to: okr.id,
          label: "contributed by",
        })),
        ...(okr.needs || []).map((to) => ({ from: okr.id, to, label: "needs" })),
        ...(okr.neededBy || []).map((from) => ({
          from,
          to: okr.id,
          label: "needed by",
        })),
      ];

      for (const rel of relations) {
        const from = inserted.current[rel.from];
        const to = inserted.current[rel.to];
        if (!from || !to) continue;

        const x = from.x + 240;
        const y = from.y + 30;
        const arrow = {
          type: "arrow",
          x,
          y,
          points: [[0, 0], [to.x - x, to.y + 30 - y]],
          strokeColor: "#1e293b",
          strokeWidth: 2,
          endArrowhead: "arrow",
          label: {
            text: rel.label,
            fontSize: 14,
            strokeColor: "#475569",
          },
        };
        allArrows.push(arrow);
      }
    }

    const arrowElements = convertToExcalidrawElements(allArrows, { regenerateIds: true });
    api.updateScene({ elements: [...api.getSceneElements(), ...arrowElements] });
  };

  return (
    <AppLayout>
      {loading ? (
        <main className="flex items-center justify-center min-h-[60vh]">
          <p>Loading Strategy Map…</p>
        </main>
      ) : (
        <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ margin: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={() => window.location.reload()}>+ New Canvas</button>
            <button onClick={handleConnectRelationships}>🔗 Connect Relationships</button>
          </div>
          <div style={{ flex: 1, display: "flex", gap: "1rem", overflow: "hidden" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ExcalidrawWithRef onApiReady={(api) => (excalidrawAPIRef.current = api)} />
            </div>
            <OkrSidebar okrs={okrs} onOkrClick={handleInsertOkr} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
