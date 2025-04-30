'use client';

import Link from 'next/link';
import SemiCircleProgress from './SemiCircleProgressProps';

type LinkedOkrCardProps = {
  progress: number;
  id?: string;
  title?: string;
  description?: string;
  state?: string;
  category?: string;
};

export default function LinkedOkrCard({
  progress,
  id,
  title = "N/A",
  description = "No description available.",
  state = "N/A",
  category = "N/A",
}: LinkedOkrCardProps) {
  // Build the URL to the objective detail page
  const objectiveUrl = id ? `/objectives/${id}` : '#';

  return (
    <div className="border p-4 rounded-md bg-gray-50 mb-4">
      <div className="w-full text-center mb-2">
        <p className="font-semibold">Linked to OKR:</p>
      </div>

      <div className="flex justify-between items-start">
        <div className="max-w-[70%] space-y-1">
          {/* Use Link without an <a> child */}
          <h3 className="text-lg font-medium">
            {id ? (
              <Link href={objectiveUrl} className="text-blue-600 hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="text-sm text-gray-700">{description}</p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center">
          <SemiCircleProgress
            strokeWidth={10}
            percentage={progress}
            size={{ width: 200, height: 100 }}
            strokeColor="#2563eb"
            bgStrokeColor="#e5e7eb"
            hasBackground={true}
            percentageSeperator="%"
            fontStyle={{
              fontSize: "16px",
              fontWeight: "bold",
              fill: "#2563eb",
            }}
          />
          <div className="mt-2 text-sm text-gray-600 text-center">
            <p>State: {state}</p>
            <p>Category: {category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
