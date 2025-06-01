"use client";

import React from "react";
import Link from "next/link";
import "@/app/styles/NotFound.css";

const NotFound = () => {
  return (
    <main className="okr404-page">
      <h1 className="error-title">404</h1>

      <div className="svg-container">
<svg
  className="okr-graph"
  viewBox="0 0 600 200"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Complete OKR Path */}
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

  {/* ❌ Broken Milestone – now centered */}
  <g transform="translate(400, 100)">
    <circle r="8" fill="#FF4C4C" />
    <line x1="-6" y1="-6" x2="6" y2="6" stroke="#fff" strokeWidth="2" />
    <line x1="6" y1="-6" x2="-6" y2="6" stroke="#fff" strokeWidth="2" />
  </g>

  {/* Broken path segment (red curve) under the red X */}
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
    </main>
  );
};

export default NotFound;
