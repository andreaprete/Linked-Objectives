'use client';
import { useState, useEffect } from "react";
import  LinkedOkrCard  from './GoalCard';
import { useParams } from 'next/navigation';

export function GoalsTabs() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchObjective() {
      const res = await fetch(`/api/objectives/${id}`);
      const json = await res.json();
      setData(json.data);
      setLoading(false);
    }
    fetchObjective();
  }, [id]);

  return (
    <section className="bg-white shadow p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <div className="space-x-4">
          <button className={activeTab === "personal" ? "border-b-2 border-blue-600" : ""} onClick={() => setActiveTab("personal")}>My Goals</button>
          <button className={activeTab === "team" ? "border-b-2 border-blue-600" : ""} onClick={() => setActiveTab("team")}>My Teams</button>
        </div>
        <button className="text-blue-600">+ Add Goal</button>
      </div>
      {data && (<div className="space-y-2">
          <LinkedOkrCard
              progress={data.linkedObjective?.progress}
              id={data.isKeyResultOf}
              title={data.linkedObjective?.title}
              description={data.linkedObjective?.description}
              state={data.linkedObjective?.state}
              category={data.linkedObjective?.category}
            />
      </div>)}
    </section>
  );
}
