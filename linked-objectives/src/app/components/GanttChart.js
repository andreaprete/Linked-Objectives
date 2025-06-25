"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "@/app/styles/GanttChart.css";

export default function GanttChart({ tasks }) {
  const router = useRouter();

  const normalizeDateStr = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{1,2}) (\w{3}) (\d{4})$/);
    if (!match) return null;
    const [_, day, monthStr, year] = match;
    const monthMap = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const month = monthMap[monthStr];
    if (!month) return null;
    return `${year}-${month}-${day.padStart(2, "0")}`;
  };

  const validTasks = tasks.filter(
    (t) => normalizeDateStr(t.start) && normalizeDateStr(t.end)
  );

  const dates = validTasks.flatMap((task) => [
    new Date(normalizeDateStr(task.start)),
    new Date(normalizeDateStr(task.end)),
  ]);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

  const dateToPercent = (dateStr) => {
    const date = new Date(normalizeDateStr(dateStr));
    const diffDays = (date - minDate) / (1000 * 60 * 60 * 24);
    return (diffDays / totalDays) * 100;
  };

  function getMonthsBetween(startDate, endDate) {
    const months = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= last) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  const months = getMonthsBetween(minDate, maxDate);

  const today = new Date();
  let todayPercent = null;
  if (today >= minDate && today <= maxDate) {
    todayPercent = ((today - minDate) / (maxDate - minDate)) * 100;
  }

  const invalidTasksCount = tasks.length - validTasks.length;

  return (
    <div className="gantt-container">
      <div className="months-header">
        {months.map((monthDate, index) => {
          const percent = ((monthDate - minDate) / (maxDate - minDate)) * 100;
          return (
            <React.Fragment key={index}>
              <div className="month-label" style={{ left: `${percent}%` }}>
                {monthDate.toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="vertical-line" style={{ left: `${percent}%` }} />
            </React.Fragment>
          );
        })}
        {todayPercent !== null && (
          <div className="today-line" style={{ left: `${todayPercent}%` }} />
        )}
      </div>

      <div className="dates-header">
        <div>{minDate.toLocaleDateString()}</div>
        <div>{maxDate.toLocaleDateString()}</div>
      </div>

      <div className="tasks-wrapper" style={{ height: validTasks.length * 50 + 60 }}>
        {validTasks.map((task, i) => {
          const leftPercent = dateToPercent(task.start);
          const rightPercent = dateToPercent(task.end);
          const widthPercent = rightPercent - leftPercent;

          return (
            <div
              key={`${task.id}-${i}`}
              className="task-bar"
              style={{
                top: i * 50 + 30,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
              onClick={() => router.push(`/objectives/${task.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/objectives/${task.id}`);
                }
              }}
            >
              {/* Start and End dates on top */}
              <div className="task-dates">
                <span className="start-date">{task.start}</span>
                <span className="end-date">{task.end}</span>
              </div>

              {/* Task title clipped with ellipsis */}
              <div className="task-text">{task.name}</div>
            </div>
          );
        })}
      </div>

      <div className="invalid-count">
        Objectives with invalid or missing dates: {invalidTasksCount}
      </div>
    </div>
  );
}
