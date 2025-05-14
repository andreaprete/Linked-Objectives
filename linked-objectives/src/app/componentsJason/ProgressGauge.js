'use client';

import React from 'react';

export default function ProgressGauge({ percentage }) {
  // Calculate the SVG arc parameters for the gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percentage / 100);
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset="0"
          transform="rotate(-90, 50, 50)"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform="rotate(-90, 50, 50)"
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-blue-600">{percentage}%</span>
      </div>
    </div>
  );
}