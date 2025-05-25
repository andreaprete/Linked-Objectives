"use client";

import React from "react";
import "@/app/styles/OkrSideBar.css";

const generateImageDataURL = (title) => {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border rectangle
  ctx.strokeStyle = "#1e1e1e";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 140, 80);

  // Text
  ctx.fillStyle = "#1e1e1e";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";

  const words = title.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < 120) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, 40 + index * 14);
  });

  return canvas.toDataURL();
};

export default function OkrSidebar({ okrs = [], onDragStart, canDrag }) {
  return (
    <aside className="okrCatalogArea w-full md:w-72">
      <div className="catalogSearchWrapper">
        <input
          type="search"
          placeholder="Search OKRs..."
          className="searchInput"
        />
      </div>
      <div className="okrCatalog">
        <h3 className="catalogTitle">OKRs</h3>
        {okrs.map((okr) => {
          const imgSrc = generateImageDataURL(okr.title);
          return (
            <img
              key={okr.id}
              src={imgSrc}
              alt={okr.title}
              draggable={canDrag}
              onDragStart={(e) => {
                if (onDragStart) onDragStart(e, okr);
                e.dataTransfer.setData("application/json", JSON.stringify(okr));
              }}
              style={{
                cursor: "grab",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          );
        })}
      </div>
    </aside>
  );
}
