"use client";
import React, { useState } from "react";
import "@/app/styles/OkrSidebar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OkrSidebar({ okrs = [], onOkrClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOkrs = okrs.filter((okr) =>
    okr.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`okrCatalogArea ${collapsed ? "collapsed" : ""}`}>
      {!collapsed && (
        <div className="catalogHeader">
          <button
            className="toggleSidebarBtn"
            onClick={() => setCollapsed(true)}
            title="Collapse"
          >
            <ChevronRight size={18} />
          </button>
          <input
            type="search"
            placeholder="Search OKRs..."
            className="searchInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {collapsed && (
        <button
          className="toggleSidebarBtn collapsed-toggle"
          onClick={() => setCollapsed(false)}
          title="Expand"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {!collapsed && (
        <div className="okrCatalog">
          {filteredOkrs.length > 0 ? (
            filteredOkrs.map((okr, index) => (
              <div
                key={`${okr.id}-${index}`}
                className="okrItem"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify(okr)
                  )
                }
                onClick={() => onOkrClick?.(okr)}
              >
                {okr.title}
              </div>
            ))
          ) : (
            <div className="placeholder">No matching OKRs</div>
          )}
        </div>
      )}
    </aside>
  );
}
