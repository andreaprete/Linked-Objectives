'use client';

import { useEffect, useState } from 'react';
import LinkedOkrCard from './GoalCard';

export function GoalsTabs({ okrs }) {
  const [fullOkrs, setFullOkrs] = useState([]);

  useEffect(() => {
    if (!okrs || okrs.length === 0) return;

    async function fetchDetailedOkrs() {
      const detailed = await Promise.all(
        okrs.map(async (okr) => {
          try {
            const res = await fetch(`/api/objectives/${okr.id}`);
            const json = await res.json();
            return { id: okr.id, ...json.data };
          } catch (err) {
            console.error(`Failed to fetch OKR ${okr.id}:`, err);
            return { id: okr.id, title: okr.label }; // fallback
          }
        })
      );

      setFullOkrs(detailed);
    }

    fetchDetailedOkrs();
  }, [okrs]);

  return (
    <section className="bg-white shadow p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold text-gray-700">My OKRs</h2>
        <button className="text-blue-600">+ Add Goal</button>
      </div>

      <div className="space-y-2">
        {fullOkrs.length === 0 ? (
          <p className="text-sm text-gray-400">You don't have any OKRs yet.</p>
        ) : (
          fullOkrs.map((okr) => (
            <LinkedOkrCard key={okr.id} id={okr.id} data={okr} />
          ))
        )}
      </div>
    </section>
  );
}
