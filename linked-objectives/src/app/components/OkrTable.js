'use client';

import '@/app/styles/OkrTable.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OkrTable({ okrs }) {
  const [visibleCount, setVisibleCount] = useState(4);
  const router = useRouter();

  const visibleOkrs = okrs.slice(0, visibleCount);

  // Check if any OKR has related departments
  const showDepartments = okrs.some(
    (okr) => okr.linkedUnits && okr.linkedUnits.length > 0
  );

  const formatDepartments = (departments) => {
    if (!departments || departments.length === 0) return '—';
    const visible = departments.slice(0, 3);
    const remaining = departments.length - visible.length;
    return remaining > 0
      ? `${visible.join(', ')} +${remaining} more`
      : visible.join(', ');
  };

  const extractIndex = (id) => {
    const match = id?.match(/obj-(\d+)/);
    return match ? parseInt(match[1], 10) : '—';
  };

  return (
    <div className="okr-table-container">
      <h2 className="okr-title">OKRs Overview</h2>

      {okrs.length === 0 ? (
        <p className="okr-empty">No OKRs found for this department.</p>
      ) : (
        <>
          <table className="okr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Objective Title</th>
                {showDepartments && <th>Related Departments</th>}
                <th>Last Modified</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {visibleOkrs.map((okr) => (
                <tr
                  key={okr.id}
                  className="okr-row"
                  onClick={() => router.push(`/objectives/${okr.id}`)}
                >
                  <td className="okr-index">{extractIndex(okr.id)}</td>
                  <td>{okr.label}</td>
                  {showDepartments && (
                    <td>{formatDepartments(okr.linkedUnits)}</td>
                  )}
                  <td>{okr.modified || 'N/A'}</td>
                  <td>{okr.state || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleCount < okrs.length && (
            <div
              className="okr-show-more"
              onClick={() => setVisibleCount((prev) => prev + 4)}
            >
              Show More ...
            </div>
          )}
        </>
      )}
    </div>
  );
}
