"use client";

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import "@/app/styles/StrategyMap.css";
import AppLayout from '@/app/components/AppLayout'; // Unified layout

// Dynamically import Excalidraw
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  { ssr: false }
);

const MOCK_OKRS_DATA = [
  { id: "okr1", type: "Objective", title: "Increase customer satisfaction", description: "Improve NPS" },
  { id: "okr2", type: "Objective", title: "Expand into new markets", description: "Launch in 2 new regions" },
  { id: "okr3", type: "Objective", title: "Improve product reliability", description: "Reduce bugs by 50%" },
  { id: "okr4", type: "Objective", title: "Enhance communication", description: "Monthly syncs + OKRs" },
  { id: "okr5", type: "Objective", title: "Boost dev velocity", description: "Cut release time in half" },
];

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

const createOkrLabelElement = (okr, parentElement) => ({
  type: "text",
  version: 1,
  versionNonce: Math.floor(Math.random() * 100000),
  isDeleted: false,
  id: `label-${okr.id}-${Date.now()}`,
  fillStyle: "solid",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 0,
  opacity: 100,
  angle: 0,
  x: parentElement.x + 10,
  y: parentElement.y + 20,
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
  const [trackedOkrsOnCanvas, setTrackedOkrsOnCanvas] = useState([]);
  const [canvasName, setCanvasName] = useState('Untitled Strategy Map');
  const excalidrawWrapperRef = useRef(null);

  const handleExcalidrawReady = (api) => {
    setExcalidrawAPI(api);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!excalidrawAPI) return;
    const okrDataString = e.dataTransfer.getData('application/json');
    if (!okrDataString) return;
    const okr = JSON.parse(okrDataString);
    const rect = excalidrawWrapperRef.current?.getBoundingClientRect?.();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const box = createOkrElement(okr, x, y);
    const label = createOkrLabelElement(okr, box);
    excalidrawAPI.addElements([box, label]);
    setTrackedOkrsOnCanvas(prev => [...prev, okr]);
  };

  const handleDragStart = (e, okr) => {
    e.dataTransfer.setData('application/json', JSON.stringify(okr));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleNewCanvas = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
      setTrackedOkrsOnCanvas([]);
      setCanvasName('Untitled Strategy Map');
    }
  };

  const objectivesOnly = MOCK_OKRS_DATA.filter(item => item.type === 'Objective');

  return (
    <AppLayout>
      <main className="contentArea flex flex-col md:flex-row gap-4">
        <div
          className="excalidrawWrapper flex-1"
          ref={excalidrawWrapperRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Excalidraw
            onReady={handleExcalidrawReady}
            initialData={{ elements: [], appState: { viewBackgroundColor: '#ffffff' } }}
            theme="light"
            UIOptions={{ canvasActions: { clearCanvas: false } }}
          />
        </div>

        <aside className="okrCatalogArea w-full md:w-72">
          <div className="catalogSearchWrapper">
            <input type="search" placeholder="Search OKRs..." className="searchInput" />
          </div>
          <div className="okrCatalog">
            <h3 className="catalogTitle">OKRs</h3>
            {objectivesOnly.map(okr => (
              <div
                key={okr.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, okr)}
                className="okrItem"
                title={okr.description || ''}
              >
                {okr.title}
              </div>
            ))}
            <button
              className="mt-4 bg-blue-500 text-white px-3 py-1 rounded"
              onClick={handleNewCanvas}
              type="button"
            >
              New Canvas
            </button>
          </div>
        </aside>
      </main>
    </AppLayout>
  );
}
