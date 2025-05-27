"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import "@/app/styles/UnifiedTopBar.css";

const routeTitleMap = {
  "/homepage": "Home",
  "/dashboard": "Dashboard",
  "/objectiveslist": "Goals",
  "/peoplelist": "Teams",
  "/users": "Users",
  "/strategy-map": "Strategy Map",
};

function getStaticTitle(pathname) {
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];
  const found = Object.keys(routeTitleMap).find(key => pathname.startsWith(key));
  if (found) return routeTitleMap[found];
  return null;
}

export default function UnifiedTopbar() {
  const pathname = usePathname();
  const [dynamicTitle, setDynamicTitle] = useState("");

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const [resource, id] = parts;

    const staticTitle = getStaticTitle(pathname);
    if (staticTitle) {
      setDynamicTitle(staticTitle);
      return;
    }

    async function fetchTitle() {
      if (!id) return;

      let url = null;
      if (resource === "objectives") {
        url = `/api/objectives/${id}`;
      } else if (resource === "key-results") {
        url = `/api/key-results/${id}`;
      }

      if (url) {
        try {
          const res = await fetch(url);
          const json = await res.json();
          setDynamicTitle(json.data?.title || id.replace(/-/g, " "));
        } catch (err) {
          console.error("Failed to fetch title:", err);
          setDynamicTitle(id.replace(/-/g, " "));
        }
      } else {
        setDynamicTitle(id.replace(/-/g, " "));
      }
    }

    fetchTitle();
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="topbar-title">{dynamicTitle || "Objectives"}</div>
      <div className="topbar-user">User</div>
    </header>
  );
}
