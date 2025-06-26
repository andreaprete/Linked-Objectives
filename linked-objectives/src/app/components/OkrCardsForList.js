"use client";

import Link from "next/link";
import "@/app/styles/LinkedOkrCardForList.css";

export default function OkrCardsForList({
  averageProgress,
  id,
  title = "N/A",
  description = "",
  category = "N/A",
}) {
  const roundedProgress = Math.round(averageProgress || 0);
  const objectiveUrl = id ? `/objectives/${id}` : "#";

  const shortDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  return (
    <div
      className="linked-okr-card compact"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="linked-okr-content-col">
        <div
          className="linked-okr-title text-xs font-medium text-blue-700 truncate mb-1"
          title={title.length > 40 ? title : undefined}
        >
          <Link href={objectiveUrl}>{title}</Link>
        </div>

        {shortDescription && (
          <p className="linked-okr-description text-xs text-gray-500 line-clamp-3">
            {shortDescription}
          </p>
        )}

        <div className="mt-2">
          <p className="okr-progress-label-left">{roundedProgress}%</p>
          <div className="okr-progress-bar-container">
            <div
              className="okr-progress-bar-fill"
              style={{ width: `${roundedProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Category: {category}</p>
        </div>
      </div>
    </div>
  );
}
