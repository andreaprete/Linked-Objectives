"use client"
import React from "react"

export default function UpcomingDeadlinesPanel({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-400 italic">No upcoming objectives in next 30 days.</p>;
  }

  return (
    <ul className="space-y-2 text-sm w-full">
      {items.map(item => (
        <li key={item.id} className="flex justify-between">
          <span className="font-medium">{item.title}</span>
          <span className="text-gray-600">{new Date(item.dueDate).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
