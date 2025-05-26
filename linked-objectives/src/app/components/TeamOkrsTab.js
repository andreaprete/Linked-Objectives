'use client';

import { useState } from 'react';
import LinkedOkrCard from './LinkedOkrCard';

export default function TeamOkrsTab({ okrs }) {
  const [caresForOpen, setCaresForOpen] = useState(true);
  const [operatesOpen, setOperatesOpen] = useState(false);
  const [accountableForOpen, setAccountableForOpen] = useState(false);

  // 🔧 For now, show all OKRs under "Cares For"
  const caresForOkrs = okrs; // Replace with filtered logic when data supports it
  const operatesOkrs = [];   // Placeholder
  const accountableOkrs = []; // Placeholder

  return (
    <div className="mt-4">
      {/* Cares For */}
      <div>
        <button
          className="collapse-toggle"
          onClick={() => setCaresForOpen(!caresForOpen)}
        >
          <span className={`collapse-icon ${caresForOpen ? 'open' : ''}`}>▼</span>
          <span className="collapse-label">Cares for</span>
        </button>
        {caresForOpen && (
          <div className="space-y-4 mt-2">
            {caresForOkrs.length > 0 ? (
              caresForOkrs.map((okr) => (
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
              <div className="collapse-empty">No OKRs available</div>
            )}
          </div>
        )}
      </div>

      {/* Operates */}
      <div className="mt-6">
        <button
          className="collapse-toggle"
          onClick={() => setOperatesOpen(!operatesOpen)}
        >
          <span className={`collapse-icon ${operatesOpen ? 'open' : ''}`}>▼</span>
          <span className="collapse-label">Operates</span>
        </button>
        {operatesOpen && (
          <div className="space-y-4 mt-2">
            {operatesOkrs.length > 0 ? (
              operatesOkrs.map((okr) => (
                <LinkedOkrCard key={okr.id} {...okr} />
              ))
            ) : (
              <div className="collapse-empty">No OKRs available</div>
            )}
          </div>
        )}
      </div>

      {/* Accountable For */}
      <div className="mt-6">
        <button
          className="collapse-toggle"
          onClick={() => setAccountableForOpen(!accountableForOpen)}
        >
          <span className={`collapse-icon ${accountableForOpen ? 'open' : ''}`}>▼</span>
          <span className="collapse-label">Accountable for</span>
        </button>
        {accountableForOpen && (
          <div className="space-y-4 mt-2">
            {accountableOkrs.length > 0 ? (
              accountableOkrs.map((okr) => (
                <LinkedOkrCard key={okr.id} {...okr} />
              ))
            ) : (
              <div className="collapse-empty">No OKRs available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
