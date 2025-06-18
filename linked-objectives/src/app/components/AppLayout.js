// AppLayout.js
"use client";

import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopbar from './UnifiedTopbar';
import { SessionProvider } from "next-auth/react"; // ✅ import SessionProvider
import "@/app/styles/AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <SessionProvider>
      <div className="app-layout">
        <UnifiedSidebar />
        <div className="main-content">
          <UnifiedTopbar />
          <div className="main-inner">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
