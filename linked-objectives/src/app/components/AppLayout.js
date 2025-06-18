// AppLayout.js
"use client";
import { usePathname } from "next/navigation";
import UnifiedSidebar from './UnifiedSidebar';
import UnifiedTopbar from './UnifiedTopbar';
import "@/app/styles/AppLayout.css";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isStrategyMap = pathname === "/strategy-map";

  return (
    <div className={`app-layout ${isStrategyMap ? "no-scroll" : ""}`}>
      <UnifiedSidebar />
      <div className="main-content">
        <UnifiedTopbar />
        <div className="main-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
