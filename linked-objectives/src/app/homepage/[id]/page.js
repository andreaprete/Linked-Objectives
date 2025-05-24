"use client";
import { SidebarNav } from "../../components/SidebarNav";
import { TopNavbar } from "../../components/TopNavbar";
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="p-6 space-y-6">
          <WelcomeBanner
            name={userData?.name}
            id={id}
            teamId={userData?.team}
          />

          <WeeklyOverview okrs={okrs} />
          <GoalsTabs okrs={okrs} />
        </main>
      </div>
    </div>
  );
}
