"use client";

import AppLayout from "@/app/components/AppLayout";
import { WelcomeBanner } from "../../components/WelcomeBanner";
import { WeeklyOverview } from "../../components/WeeklyOverview";
import GoalTab from "@/app/components/GoalTab";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [okrs, setOkrs] = useState([]); // Already detailed!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/people/${id}`);
        const json = await res.json();
        setUserData(json.data);
        setOkrs(json.okrs); // Already in [{id, title, state, progress}]
      } catch (err) {
        console.error("Failed to load OKR data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <main className="dashboardContent flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Homepage Data...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="p-6 space-y-6">
        <WelcomeBanner
          name={userData?.name}
          id={id}
          teamId={userData?.team}
        />
        <WeeklyOverview okrs={okrs} />
        <GoalTab okrs={okrs} loading={false} onAddGoal={() => {}} />
      </main>
    </AppLayout>
  );
}
