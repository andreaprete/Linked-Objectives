"use client";

import { useEffect, useState } from "react";
import GoalCard from "./GoalCard";
import "@/app/styles/WeeklyOverview.css";

export function WeeklyOverview({ okrs = [] }) {
  const [goals, setGoals] = useState([]);
  const [weekLabel, setWeekLabel] = useState("");

  useEffect(() => {
    const today = new Date();

    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const formatDate = (date) =>
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
      }).format(date);

    const getWeekNumber = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    };

    const weekNum = getWeekNumber(today);
    setWeekLabel(`Week ${weekNum} | ${formatDate(monday)} - ${formatDate(sunday)}`);

    const parseToDate = (str) => {
      const date = new Date(str);
      return isNaN(date) ? new Date(Date.parse(str + " GMT")) : date;
    };

    const filtered = okrs.filter((okr) => {
      const rawEnd = okr.interval?.hasEnd || okr.temporal?.end;
      if (!rawEnd) return false;
      const endDate = parseToDate(rawEnd);
      return endDate >= monday && endDate <= sunday;
    });

    const unique = Array.from(new Map(filtered.map(o => [o.id, o])).values());
    setGoals(unique);
  }, [okrs]);

  return (
    <section className="weekly-overview">
      <h3 className="weekly-overview-heading">{weekLabel}</h3>
      <div className="weekly-overview-list">
        {goals.length === 0 ? (
          <p className="weekly-overview-empty">
            You're all set — no OKRs due this week!
          </p>
        ) : (
          goals.map((okr) => (
            <GoalCard
              key={okr.id}
              id={okr.id}
              title={okr.title}
              state={okr.state}
              progress={okr.progress}
            />
          ))
        )}
      </div>
    </section>
  );
}
