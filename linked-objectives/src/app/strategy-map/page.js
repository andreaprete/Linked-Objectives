"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import "@/app/styles/StrategyMap.css";
import AppLayout from "@/app/components/AppLayout";
import OkrSidebar from "@/app/components/OkrSidebar";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

const createOkrElement = (okr, x, y) => ({
  id: `okr-${okr.id}-${Date.now()}`,
  type: "rectangle",
  x,
  y,
  width: 200,
  height: 60,
  angle: 0,
  strokeColor: "#1f2937",
  backgroundColor: "#93c5fd",
  fillStyle: "solid",
  strokeWidth: 1,
  roughness: 1,
  opacity: 100,
  groupIds: [],
  seed: Math.floor(Math.random() * 100000),
  version: 1,
  versionNonce: Math.floor(Math.random() * 100000),
  isDeleted: false,
  locked: false,
  boundElements: [],
  updated: Date.now(),
});

const createOkrLabelElement = (okr, parent) => ({
  type: "text",
  version: 1,
  versionNonce: Math.floor(Math.random() * 100000),
  isDeleted: false,
  id: `label-${okr.id}-${Date.now()}`,
  fillStyle: "solid",
  strokeWidth: 1,
  roughness: 0,
  opacity: 100,
  angle: 0,
  x: parent.x + 10,
  y: parent.y + 20,
  width: 180,
  height: 20,
  seed: Math.floor(Math.random() * 100000),
  groupIds: [],
  strokeColor: "#000000",
  backgroundColor: "transparent",
  boundElements: [],
  updated: Date.now(),
  locked: false,
  text: okr.title,
  fontSize: 18,
  fontFamily: 1,
  textAlign: "left",
  verticalAlign: "top",
  baseline: 14,
});

export default function StrategyMapPage() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const wrapperRef = useRef(null);
  const [okrs, setOkrs] = useState([]);

  useEffect(() => {
    async function fetchOKRs() {
      try {
        const res = await fetch("/api/objectiveslist");
        const data = await res.json();
        setOkrs(data);
      } catch (err) {
        console.error("❌ Failed to fetch OKRs:", err);
      }
    }
    fetchOKRs();
  }, []);

  const handleInsertOkr = (okr, e) => {
    if (
      !excalidrawAPI ||
      typeof excalidrawAPI.viewportCoordsToSceneCoords !== "function"
    ) {
      console.error("❌ Excalidraw API not ready");
      return;
    }

    // ✅ Calculate scene coords based on canvas container
    const rect = wrapperRef.current.getBoundingClientRect();
    const coords = excalidrawAPI.viewportCoordsToSceneCoords({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    const box = createOkrElement(okr, coords.x, coords.y);
    const label = createOkrLabelElement(okr, box);
    excalidrawAPI.addElements([box, label]);
  };

  return (
    <AppLayout>
      <div className="newCanvasBar">
        <button
          className="newCanvasBtn"
          onClick={() => window.location.reload()}
        >
          + New Canvas
        </button>
      </div>

      <main className="contentArea flex flex-col md:flex-row gap-4">
        <div className="excalidrawWrapper flex-1" ref={wrapperRef}>
          <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
        </div>

        <OkrSidebar okrs={okrs} onOkrClick={handleInsertOkr} />
      </main>
    </AppLayout>
  );
}
