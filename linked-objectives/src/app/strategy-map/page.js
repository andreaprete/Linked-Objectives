// src/app/strategy-map/page.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './StrategyMap.module.css';

// --- CORRECTED IMPORTS using path alias ---
import LeftSidebar from '@/app/components/Layout/LeftSidebar'; // Correct alias path
import TopBar from '@/app/components/Layout/TopBar';          // Correct alias path

// Dynamically import Excalidraw
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => <div className={styles.placeholder}><p>Initializing Canvas...</p></div>,
  }
);

// Keep helper functions specific to this page's logic (or move to utils)
const createOkrElement = (okr, x, y) => { /* ... */ };
const createOkrLabelElement = (okr, parentElement) => { /* ... */ };

// Keep mock data specific to this page (or fetch)
const MOCK_OKRS_DATA = [ /* ... */ ];
const MOCK_RELATIONSHIPS = [ /* ... */ ];


// --- Main Page Component ---
export default function StrategyMapPage() {
  // --- State specific to the Strategy Map page ---
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [trackedOkrsOnCanvas, setTrackedOkrsOnCanvas] = useState([]);
  const excalidrawWrapperRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [actuallyRenderExcalidraw, setActuallyRenderExcalidraw] = useState(false);
  const [canvasName, setCanvasName] = useState('Untitled Strategy Map'); // Moved from TopBar

  // --- State needed by layout components (managed here) ---
  const [activeSidebarItem, setActiveSidebarItem] = useState('Editor');

  // --- Effects specific to this page ---
  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => { setActuallyRenderExcalidraw(true); }, 100);
      return () => clearTimeout(timer);
    }
  }, [isClient]);
  useEffect(() => { // Relationship drawing effect
      if (!excalidrawAPI || trackedOkrsOnCanvas.length < 1 || !actuallyRenderExcalidraw) return;
      // ... relationship drawing logic using excalidrawAPI and trackedOkrsOnCanvas ...
  }, [excalidrawAPI, trackedOkrsOnCanvas, actuallyRenderExcalidraw]);

  // --- Handlers specific to this page ---
  const handleDrop = (e) => {
    e.preventDefault();
    if (!excalidrawAPI || !excalidrawWrapperRef.current || !actuallyRenderExcalidraw) return;
    const okrDataString = e.dataTransfer.getData('application/json');
    if (!okrDataString) return;
    const okr = JSON.parse(okrDataString);
    // ... rest of drop logic using excalidrawAPI, helpers, setTrackedOkrsOnCanvas ...
  };
  const handleDragStart = (e, okr) => { e.dataTransfer.setData('application/json', JSON.stringify(okr)); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const onExcalidrawChange = (elements, appState, files) => { /* ... */ };
  const excalidrawRef = useCallback((api) => { if (api !== null) { setExcalidrawAPI(api); } }, []);

  // --- Handlers needed by layout components (defined here, passed as props) ---
  const handleSidebarClick = (itemName) => {
      console.log(`${itemName} clicked on StrategyMap page`);
      setActiveSidebarItem(itemName);
      // Potentially navigate using Next.js router here
  };
  const handleNewCanvas = () => {
    if (excalidrawAPI && actuallyRenderExcalidraw) {
      excalidrawAPI.resetScene();
      setTrackedOkrsOnCanvas([]);
      setCanvasName('Untitled Strategy Map'); // Reset name managed by this page
    }
  };

  // Filter OKRs for the catalog
  const objectivesOnly = MOCK_OKRS_DATA.filter(item => item.type === 'Objective');

  // --- Render ---
  return (
    // Use the main page wrapper style from this page's CSS module if needed,
    // or create a common Layout.module.css
    <div className={styles.pageWrapper}>

        <LeftSidebar
            activeItem={activeSidebarItem}
            onNavItemClick={handleSidebarClick}
        />

        <div className={styles.rightContentWrapper}>

            <TopBar
                pageTitle="Editor Map"
                canvasName={canvasName}
                onNewCanvasClick={handleNewCanvas}
                // Pass other necessary props like user data, notification count if needed
            />

            {/* Content Area specific to Strategy Map */}
            <main className={styles.contentArea}>
                 {/* Excalidraw Canvas Wrapper */}
                 <div
                    className={styles.excalidrawWrapper}
                    ref={excalidrawWrapperRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                 >
                    {actuallyRenderExcalidraw ? (
                        <Excalidraw
                            ref={excalidrawRef}
                            initialData={{ elements: [], appState: { viewBackgroundColor: '#ffffff' } }}
                            onChange={onExcalidrawChange}
                            theme="light"
                            UIOptions={{ canvasActions: { clearCanvas: false } }}
                        />
                    ) : (
                        <div className={styles.placeholder}><p>Preparing Canvas...</p></div>
                    )}
                 </div>

                 {/* OKR Catalog Area */}
                 <aside className={styles.okrCatalogArea}>
                    <div className={styles.catalogSearchWrapper}>
                        <input type="search" placeholder="Search OKRs..." className={styles.searchInput} />
                    </div>
                    <div className={styles.okrCatalog}>
                         <h3 className={styles.catalogTitle}>OKRs</h3>
                         {objectivesOnly.map(okr => (
                             <div key={okr.id} draggable="true" onDragStart={(e) => handleDragStart(e, okr)} className={styles.okrItem} title={okr.description || ''}>
                                 {okr.title}
                             </div>
                          ))}
                    </div>
                  </aside>
            </main> {/* End contentArea */}

        </div> {/* End rightContentWrapper */}

    </div> // End pageWrapper
  );
}

// Ensure helper functions createOkrElement, createOkrLabelElement are defined above
// Remove Sub-Components SidebarItem, DropdownMenu if they are now defined within the imported components