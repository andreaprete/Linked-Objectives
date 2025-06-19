"use client";

import AppLayout from "@/app/components/AppLayout";
import { WelcomeBanner } from "../../components/WelcomeBanner";
import { WeeklyOverview } from "../../components/WeeklyOverview";
import GoalTab from "@/app/components/GoalTab";
import CreateObjectiveModal from "@/app/components/CreateObjectiveModal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { id } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/people/${id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
          },
        });

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

  async function handleCreateOKR(formData) {
    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const json = await res.json();
        router.push(`/objectives/${json.id}`);
      } else {
        alert("Failed to create OKR");
      }
    } catch (error) {
      console.error("Error creating OKR:", error);
    }
  }

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
      <main className="p-6 space-y-6 w-[80%] mx-auto">
        <WelcomeBanner name={userData?.name} id={id} teamId={userData?.team} />
        <WeeklyOverview okrs={okrs} />
        <GoalTab
          okrs={okrs}
          loading={false}
          onAddGoal={() => setShowCreateModal(true)}
        />
        <CreateObjectiveModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateOKR}
        />
      </main>
    </AppLayout>
  );
}
