// app/components/AppLayout.js
"use client";

import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopbar from './UnifiedTopbar';
import GlobalLoadingOverlay from './GlobalLoadingOverlay';
import { LoadingProvider } from "@/app/contexts/LoadingContext";
import { SessionProvider } from "next-auth/react";
import "@/app/styles/AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <GlobalLoadingOverlay />
        <div className="app-layout">
          <UnifiedSidebar />
          <div className="main-content">
            <UnifiedTopbar />
            <div className="main-inner">
              {children}
            </div>
          </div>
        </div>
      </LoadingProvider>
    </SessionProvider>
  );
}
