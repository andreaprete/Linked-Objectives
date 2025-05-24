"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LinkedOkrCard } from "./GoalCard";
import '@/app/styles/WeeklyOverview.css';


export function WeeklyOverview() {
  const { id } = useParams(); 
  const [goals, setGoals] = useState([]);
  const [weekLabel, setWeekLabel] = useState("");

  useEffect(() => {
    if (!id) return;

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
      const tempDate = new Date(date.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((tempDate - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
      );
    };

    const weekNum = getWeekNumber(today);
    setWeekLabel(
      `Week ${weekNum} | ${formatDate(monday)} - ${formatDate(sunday)}`
    );

    fetch(`/api/people/${id}`)
      .then((res) => res.json())
      .then((resJson) => {
        const allOkrs = resJson.okrs || [];

        Promise.all(
          allOkrs.map((okr) =>
            fetch(`/api/objectives/${okr.id}`)
              .then((res) => res.json())
              .then((json) => ({ id: okr.id, ...json.data }))
          )
        ).then((detailedOkrs) => {
          const filtered = detailedOkrs.filter((okr) => {
            const endDate = new Date(okr.temporal?.end);
            return endDate >= monday && endDate <= sunday;
          });

          setGoals(filtered);
        });
      });
  }, [id]);

  return (
    <section className="weekly-overview">
      <h3 className="weekly-overview-heading">{weekLabel}</h3>
      <div className="weekly-overview-list">
        {goals.length === 0 ? (
          <p className="weekly-overview-empty">You're all set — no OKRs due this week!</p>
        ) : (
          goals.map((goal) => <LinkedOkrCard key={goal.id} goal={goal} />)
        )}
      </div>
    </section>
  );
}
