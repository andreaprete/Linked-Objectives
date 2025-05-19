import { useEffect, useState } from "react";
import { GoalCard } from "./GoalCard";

export function WeeklyOverview() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetch("/api/goals/week").then((res) => res.json()).then(setGoals);
  }, []);

  return (
    <section className="bg-white shadow p-4 rounded">
      <h3 className="text-sm font-medium text-gray-500">Week 15 | April 1 - April 7</h3>
      <div className="space-y-2 mt-2">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
