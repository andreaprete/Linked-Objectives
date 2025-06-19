"use client";
import styles from "@/app/styles/GoalCard.module.css";
import Link from "next/link";

export default function GoalCard({ id, title, state, progress }) {
  // For status dot color, optionally set className dynamically
  const getStateColorClass = (state) => {
    switch (state) {
      case "Draft":
      case "Idea":
      case "Planned":
        return styles["dot-blue"];
      case "Evaluating":
      case "Approved":
      case "Released":
        return styles["dot-purple"];
      case "InProgress":
      case "Completed":
      case "Archived":
        return styles["dot-green"];
      case "Aborted":
      case "Withdrawn":
      case "Rejected":
      case "Cancelled":
        return styles["dot-red"];
      case "OnHold":
      case "Deprecated":
        return styles["dot-orange"];
      default:
        return styles["dot-gray"];
    }
  };

  return (
    <Link
      href={`/objectives/${id}`}
      className={styles["goal-card-row"]}
      style={{ textDecoration: "none" }}
    >
      <div className={styles["goal-title"]}>{title}</div>

      <div className={styles["goal-status"]}>
        <span
          className={`${styles["goal-dot"]} ${getStateColorClass(state)}`}
        />
        <span className={styles["goal-state"]}>{state}</span>
      </div>

      <div className={styles["goal-progress-area"]}>
        <div className={styles["goal-progress-bar-bg"]}>
          <div
            className={styles["goal-progress-bar-fill"]}
            style={{ width: `${progress || 0}%` }}
          />
        </div>
        <span className={styles["goal-percent"]}>
          {Math.round(progress || 0)}%
        </span>
      </div>
    </Link>
  );
}
