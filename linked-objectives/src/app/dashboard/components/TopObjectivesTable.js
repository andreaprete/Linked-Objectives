"use client"
import React from "react"

export default function TopObjectivesTable({ objectives }) {
  if (!objectives || objectives.length === 0) {
    return <p className="text-gray-400 italic">No top objectives with due dates.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="tableStyle w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {objectives.map(obj => (
            <tr key={obj.id}>
              <td>{obj.title}</td>
              <td>{obj.categoryName}</td>
              <td>{obj.statusName}</td>
              <td>{obj.progress}%</td>
              <td>{obj.dueDate ? new Date(obj.dueDate).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
