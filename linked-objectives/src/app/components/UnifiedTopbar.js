"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import "@/app/styles/UnifiedTopBar.css";

// Map your routes to friendly titles
const routeTitleMap = {
  "/homepage": "Home",
  "/dashboard": "Dashboard",
  "/objectiveslist": "Goals",
  "/peoplelist": "Teams",
  "/users": "Users",
  "/strategy-map": "Editor",
};

function getTitle(pathname) {
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];
  const found = Object.keys(routeTitleMap).find(key => pathname.startsWith(key));
  if (found) return routeTitleMap[found];
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last) return "OKR Management";
  return last
    .replace(/-/g, " ");
}

export default function UnifiedTopbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-user">User</div>
    </header>
  );
}
