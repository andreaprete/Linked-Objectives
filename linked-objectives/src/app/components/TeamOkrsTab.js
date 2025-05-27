'use client';

import { useState } from 'react';
import LinkedOkrCard from './LinkedOkrCard';

export default function TeamOkrsTab({ okrs }) {
  const [caresForOpen, setCaresForOpen] = useState(true);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Team OKRs</h2>

      <div className="space-y-6">
        <div>
          <button
            className="flex items-center mb-2 w-full text-left"
            onClick={() => setCaresForOpen(!caresForOpen)}
          >
            <div className="text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transform transition-transform ${caresForOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="ml-2 text-lg text-gray-600">Cares for</div>
          </button>

          {caresForOpen && (
            <div className="space-y-4">
              {okrs.length > 0 ? (
                okrs.map((okr) => (
                  <LinkedOkrCard
                    key={okr.id}
                    id={okr.id}
                    title={okr.title}
                    description={okr.description}
                    averageProgress={okr.progress}
                    state={okr.state}
                    category={okr.category}
                  />
                ))
              ) : (
                <div className="py-4 text-center text-gray-500 italic">
                  No OKRs available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
