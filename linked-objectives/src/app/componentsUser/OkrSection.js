// components/OkrSection.js

import OkrCard from './OkrCard';

export default function OkrSection({ title, okrs = [] }) {
  return (
    <div className="mb-6">
      <h3 className="text-gray-500 text-sm uppercase mb-2">{title}</h3>
      {okrs.length > 0 ? (
        okrs.map((okr, index) => (
          <OkrCard
            key={index}
            title={okr.title}
            description={okr.description}
            progress={okr.progress || 0}
          />
        ))
      ) : (
        <div className="text-sm text-gray-400 italic">No items available yet.</div>
      )}
    </div>
  );
}
