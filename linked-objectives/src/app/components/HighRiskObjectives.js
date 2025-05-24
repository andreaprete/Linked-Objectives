"use client"
import React from "react"

export default function HighRiskObjectives({ overdue = [], stale = [] }) {
  const total = (overdue?.length || 0) + (stale?.length || 0);
  if (total === 0) {
    return <p className="text-gray-400 italic">No high-risk objectives found.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {overdue.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-red-500">Overdue (0% progress)</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {overdue.map(obj => (
              <li key={obj.id}>
                {obj.title} (Due: {new Date(obj.dueDate).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}

      {stale.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-yellow-600 mt-3">Stalled (&gt;30d no updates)</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {stale.map(obj => (
              <li key={obj.id}>
                {obj.title} (Last Update: {new Date(obj.modifiedDate).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
