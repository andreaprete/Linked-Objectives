"use client";

import Link from "next/link";
import SemiCircleProgress from "./SemiCircleProgressProps";
import "@/app/styles/LinkedOkrCard.css";

/* helper copied from your objective page */
const stateColor = (s) => {
  switch (s) {
    case "Draft":
    case "Idea":
    case "Planned":
      return "state-blue";
    case "Evaluating":
    case "Approved":
    case "Released":
      return "state-purple";
    case "InProgress":
    case "Completed":
    case "Archived":
      return "state-green";
    case "Aborted":
    case "Withdrawn":
    case "Rejected":
    case "Cancelled":
      return "state-red";
    case "OnHold":
    case "Deprecated":
      return "state-orange";
    default:
      return "state-gray";
  }
};

export default function LinkedOkrCard({
  averageProgress = 0,
  id,
  title = "N/A",
  description = "No description available.",
  state = "N/A",
  category = "N/A",
}) {
  return (
    <div className="linked-okr-card">
      <div className="linked-okr-header">Linked to OKR:</div>

      <div className="linked-okr-content">
        {/* -------- text column -------- */}
        <div className="linked-okr-text">
          <h3 className="linked-okr-title">
            {id ? <Link href={`/objectives/${id}`}>{title}</Link> : title}
          </h3>
          <p className="linked-okr-description">{description}</p>
        </div>

        {/* -------- gauge + meta -------- */}
        <div className="linked-okr-stats">
          <SemiCircleProgress
            strokeWidth={10}
            averageProgress={averageProgress}
            size={{ width: 200, height: 100 }}
            strokeColor="#2563eb"
            bgStrokeColor="#e5e7eb"
            hasBackground
            percentageSeperator="%"
            fontStyle={{ fontSize: "16px", fontWeight: "bold", fill: "#2563eb" }}
          />

          <div className="linked-okr-meta">
            <p>
              State:{" "}
              <span className={stateColor(state)} style={{ fontWeight: 600 }}>
                {state}
              </span>
            </p>
            <p>Category: {category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
