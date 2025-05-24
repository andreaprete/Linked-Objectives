'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import "@/app/styles/KeyResultsComponent.css"; 

export default function KeyResults({ ids = [] }) {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKeyResults() {
      const results = [];
      for (const id of ids) {
        try {
          const res = await fetch(`/api/key-results/${id}`);
          const json = await res.json();
          results.push({ id, ...json.data });
        } catch (e) {
          console.error(`Error loading key result ${id}:`, e);
        }
      }
      setKeyResults(results);
      setLoading(false);
    }

    fetchKeyResults();
  }, [ids]);

  if (loading) return <p>Loading key results...</p>;
  if (!keyResults.length) return <p>No key results found.</p>;

  return (
    <div className="keyresults-wrapper">
      {keyResults.map((kr) => (
        <div key={kr.id} className="keyresult-card">
          <div>
            <Link href={`/key-results/${kr.id}`} className="keyresult-title">
              {kr.title}
            </Link>
            <p className="keyresult-comment">
              {kr.comment || 'No comment available.'}
            </p>
          </div>
          <div className="keyresult-progress">
            {kr.progress ? `${kr.progress}%` : '0%'}
          </div>
        </div>
      ))}
    </div>
  );
}
