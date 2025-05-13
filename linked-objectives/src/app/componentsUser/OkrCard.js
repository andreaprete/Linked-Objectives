'use client';

import Link from 'next/link';
import ProgressGauge from './ProgressGauge';

export default function OkrCard({ okr }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{okr.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{okr.description}</p>
        
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-500">
            <p>Category: {okr.category}</p>
            <p>Status: {okr.status}</p>
          </div>
          
          <ProgressGauge percentage={okr.progress} />
        </div>
      </div>
    </div>
  );
}