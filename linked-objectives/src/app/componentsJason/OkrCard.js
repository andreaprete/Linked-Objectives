'use client';

import Link from 'next/link';
import ProgressGauge from './ProgressGauge';

export default function OkrCard({ okr }) {
  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-600 hover:underline">
          <Link href={`/objectives/${okr.id}`}>
            {okr.id}
          </Link>
        </h3>

        <p className="text-gray-600 text-sm mb-4">{okr.label}</p>

        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-500 space-y-1">
            <p><span className="font-medium">Category:</span> {okr.category}</p>
            <p><span className="font-medium">Status:</span> {okr.state}</p>
          </div>

          <ProgressGauge percentage={okr.progress} />
        </div>
      </div>
    </div>
  );
}
