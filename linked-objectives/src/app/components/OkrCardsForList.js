"use client";

import Link from "next/link";
import SemiCircleProgress from "./SemiCircleProgressProps.js";
import "@/app/styles/LinkedOkrCard.css";

export default function OkrCardsForList({
  averageProgress,
  id,
  title = "N/A",
  description = "No description available.",
  state = "N/A",
  category = "N/A",
}) {
  const objectiveUrl = id ? `/objectives/${id}` : "#";
  return (
    <div className="linked-okr-card">
      <div className="linked-okr-content">
        <div className="linked-okr-text">
          <h3 className="linked-okr-title">
            {id ? <Link href={objectiveUrl}>{title}</Link> : title}
          </h3>
          <p className="linked-okr-description">{description}</p>
        </div>

        <div className="linked-okr-stats">
          <SemiCircleProgress
            strokeWidth={10}
            averageProgress={averageProgress}
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
          <div className="linked-okr-meta">
            <p>State: {state}</p>
            <p>Category: {category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
