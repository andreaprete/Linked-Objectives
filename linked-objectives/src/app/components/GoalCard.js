'use client';

import Link from 'next/link';
import '@/app/styles/LinkedOkrCard.css';

export default function LinkedOkrCard({ data, id }) {
  if (!data) return null;

  const {
    title = "Untitled Objective",
    state = "In Progress",
    progress = 0,
  } = data;

  return (
    <div className="linked-okr-row">
      <div className="flex-1">
        <Link href={`/objectives/${id}`} className="linked-okr-title">
          {title}
        </Link>
      </div>

      <div className="linked-okr-status">
        <span className="linked-okr-status-dot" />
        <span>{state}</span>
      </div>

      <div className="linked-okr-progress">
        <div className="linked-okr-progress-bar">
          <div
            className="linked-okr-progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="linked-okr-percentage">{progress}%</span>
      </div>
    </div>
  );
}
