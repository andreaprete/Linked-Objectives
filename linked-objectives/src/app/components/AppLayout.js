"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopbar from './UnifiedTopbar';
import GlobalLoadingOverlay from './GlobalLoadingOverlay';
import { useLoading } from "@/app/contexts/LoadingContext";
import "@/app/styles/AppLayout.css";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const { isPageTransitioning, loadingLabel, stopPageTransition } = useLoading();

  // ✅ Stop loading when pathname changes
  useEffect(() => {
    stopPageTransition();
  }, [pathname]);

  return (
    <div className={`app-layout ${isStrategyMap ? "no-scroll" : ""}`}>
      <UnifiedSidebar />
      <div className="main-content">
        <UnifiedTopbar />
        <div
          className="main-inner"
          style={{
            pointerEvents: isPageTransitioning ? "none" : "auto",
            filter: isPageTransitioning ? "blur(4px)" : "none",
            transition: "filter 0.3s ease",
            position: "relative",
          }}
        >
          {children}
          {isPageTransitioning && (
            <div className="loading-backdrop">
              <div className="loading-box">
                <div className="loading-spinner" />
                <p className="loading-text">{loadingLabel}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <GlobalLoadingOverlay />
    </div>
  );
}
