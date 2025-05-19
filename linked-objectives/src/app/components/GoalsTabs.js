'use client'
import { useState, useEffect } from "react";
import { GoalCard } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/GoalCard";

export function GoalsTabs() {
  const [tab, setTab] = useState("personal");
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetch(`/api/goals/${tab}`).then((res) => res.json()).then(setGoals);
  }, [tab]);

  return (
    <section className="bg-white shadow p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <div className="space-x-4">
          <button className={tab === "personal" ? "border-b-2 border-blue-600" : ""} onClick={() => setTab("personal")}>My Goals</button>
          <button className={tab === "team" ? "border-b-2 border-blue-600" : ""} onClick={() => setTab("team")}>My Teams</button>
        </div>
        <button className="text-blue-600">+ Add Goal</button>
      </div>
      <div className="space-y-2">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
