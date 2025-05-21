'use client';
import { SidebarNav } from "../../components/SidebarNav";
import { TopNavbar } from "../../components/TopNavbar";
import { WelcomeBanner } from "../../components/WelcomeBanner";
import { WeeklyOverview } from "../../components/WeeklyOverview";
import { GoalsTabs } from "../../components/GoalsTabs";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`/api/people/${id}`);
        const json = await res.json();
        console.log('Fetched OKR data:', json.data);
        setData(json.data);
      } catch (err) {
        console.error('Failed to load OKR data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOkr();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="p-6 space-y-6">
          <WelcomeBanner />
          <WeeklyOverview />
          <GoalsTabs />
        </main>
      </div>
    </div>
  );
}