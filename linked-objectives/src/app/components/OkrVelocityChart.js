"use client"

import React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts"

export default function OkrVelocityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400 italic">
        No creation data available.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 opacity-75" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4A5568" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#4A5568" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
