"use client";

import AppLayout from "@/app/components/AppLayout"; // unified layout!
import { WelcomeBanner } from "../../components/WelcomeBanner";
import { WeeklyOverview } from "../../components/WeeklyOverview";
import { GoalsTabs } from "../../components/GoalsTabs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/people/${id}`);
        const json = await res.json();
        setUserData(json.data);
        setOkrs(json.okrs);
      } catch (err) {
        console.error("Failed to load OKR data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return (
    <AppLayout>
      <div className="p-6">Loading...</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <main className="p-6 space-y-6">
        <WelcomeBanner
          name={userData?.name}
          id={id}
          teamId={userData?.team}
        />

        <WeeklyOverview okrs={okrs} />
        <GoalsTabs okrs={okrs} />
      </main>
    </AppLayout>
  );
}
