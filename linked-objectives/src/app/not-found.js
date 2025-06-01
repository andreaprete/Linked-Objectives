"use client";

import React from "react";
import Link from "next/link";
import "@/app/styles/NotFound.css";

// 🎯 Background Broken OKRs config
const bgBrokenOKRs = [
  { top: '10%', left: '10%', rotate: '-15deg', color: '#FF4C4C' },    // red
  { top: '30%', right: '10%', rotate: '10deg', color: '#0078B8' },    // blue
  { bottom: '20%', left: '20%', rotate: '-25deg', color: '#999999' }, // grey
  { bottom: '15%', right: '25%', rotate: '20deg', color: '#FF4C4C' }, // red
  { top: '50%', left: '45%', rotate: '-5deg', color: '#0078B8' },     // blue
];

// 🧩 Broken OKR SVG Fragment
const BrokenOKRIcon = ({ style, color = "#0078B8", opacity = 0.1 }) => (
  <svg
    viewBox="0 0 60 60"
    width="80"
    height="80"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M10 30 Q20 10 30 30 T50 30"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeDasharray="4 2"
      opacity={opacity}
    />
    <g transform="translate(40,30)" opacity={opacity + 0.1}>
      <circle r="6" fill={color} />
      <line x1="-4" y1="-4" x2="4" y2="4" stroke="#fff" strokeWidth="1.5" />
      <line x1="4" y1="-4" x2="-4" y2="4" stroke="#fff" strokeWidth="1.5" />
    </g>
  </svg>
);

// 🔧 Main 404 Component
const NotFound = () => {
  return (
    <main className="okr404-page">
      {/* 🧠 Background failed OKRs */}
      <div className="okr-bg-icons">
        {bgBrokenOKRs.map((pos, index) => (
          <BrokenOKRIcon
            key={index}
            color={pos.color}
            style={{
              position: 'absolute',
              ...pos,
              transform: `rotate(${pos.rotate})`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}
      </div>

      {/* 🎯 Foreground content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 className="error-title">404</h1>

        <div className="svg-container">
          <svg
            className="okr-graph"
            viewBox="0 0 600 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* OKR Path */}
            <path
              d="M100 100 Q200 30 300 100 T500 100"
              stroke="#0078B8"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="8 4"
            />

            {/* Milestones */}
            <circle cx="100" cy="100" r="6" fill="#0078B8" />
            <circle cx="300" cy="100" r="6" fill="#0078B8" />
            <circle cx="500" cy="100" r="6" fill="#0078B8" />

            {/* ❌ Broken Milestone */}
            <g transform="translate(400, 100)">
              <circle r="8" fill="#FF4C4C" />
              <line x1="-6" y1="-6" x2="6" y2="6" stroke="#fff" strokeWidth="2" />
              <line x1="6" y1="-6" x2="-6" y2="6" stroke="#fff" strokeWidth="2" />
            </g>

            {/* Red broken segment */}
            <path
              d="M300 100 Q350 160 400 100"
              stroke="#FF4C4C"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="5 3"
            />
          </svg>
        </div>

        <h2>Objective not located</h2>
        <p>
          Looks like this OKR didn’t make it to the finish line.<br />
        </p>

        <Link href="/">
          <button className="home-btn">Back to Dashboard</button>
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
