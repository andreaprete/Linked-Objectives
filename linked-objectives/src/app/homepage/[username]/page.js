"use client";

import AppLayout from "@/app/components/AppLayout";
import { WelcomeBanner } from "../../components/WelcomeBanner";
import { WeeklyOverview } from "../../components/WeeklyOverview";
import GoalTab from "@/app/components/GoalTab";
import CreateObjectiveModal from "@/app/components/CreateObjectiveModal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { username } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [userData, setUserData] = useState(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Authorization check
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    async function checkAuthorization() {
      const loggedInEmail = session.user.email;
      const role = session.user.role;

      try {
        const res = await fetch(`/api/getUsername?email=${loggedInEmail}`, {
          cache: "no-store",
        });

        const json = await res.json();
        const loggedInUsername = json.username;

        const isOwner = loggedInUsername === username;
        const isAdmin = role === "admin";

        if (!isOwner && !isAdmin) {
          setAuthorized(false);
          router.push("/unauthorized");
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Error verifying ownership:", err);
        setAuthorized(false);
        router.push("/unauthorized");
      }
    }

    checkAuthorization();
  }, [session, username, status, router]);

  // Data fetching, only after authorization
  useEffect(() => {
    if (!username || authorized !== true) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/people/${username}`);
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
  }, [username, authorized]);

  async function handleCreateOKR(formData) {
    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (status === "loading" || authorized === null || loading) {
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
        <WelcomeBanner name={userData?.name} id={username} teamId={userData?.team} />
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
