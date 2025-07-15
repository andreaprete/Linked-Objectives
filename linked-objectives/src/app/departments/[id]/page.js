"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import AppLayout from "@/app/components/AppLayout";
import DepartmentHeader from "@/app/components/DepartmentHeader";
import TeamCard from "@/app/components/TeamCard";
import OkrTable from "@/app/components/OkrTable";

export default function DepartmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const teamsRef = useRef(null);
  const okrsRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDepartment() {
      try {
        const res = await fetch(`/api/departments/${id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();

        if (!res.ok || json.error) {
          setRedirecting(true); // trigger pause
          router.replace("/not-found");
          return;
        }

        setData(json);
      } catch (err) {
        console.error("Failed to load department data:", err);
        setRedirecting(true);
        router.replace("/not-found");
      } finally {
        setLoading(false);
      }
    }

    fetchDepartment();
  }, [id, router]);

  // 🚧 Block render during redirect
  if (redirecting) return null;

  if (loading) {
    return (
      <AppLayout>
        <main className="dashboardContent flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Department Data...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  const employeeCount = Object.values(data.teams || {}).reduce(
    (acc, team) => acc + team.members.length,
    0
  );

  const handleStatClick = (section) => {
    if (section === "teams" || section === "employees") {
      teamsRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (section === "okrs") {
      okrsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AppLayout>
      <main className="p-6 space-y-6 w-[80%] mx-auto">
        <DepartmentHeader
          name={data.department}
          company={data.company}
          homepage={data.homepage}
          stats={{
            teamCount: Object.keys(data.teams || {}).length,
            employeeCount,
            okrCount: data.okrs.length,
          }}
          onStatClick={handleStatClick}
        />

        {/* Teams Section */}
        <div ref={teamsRef} className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teams</h2>
          {data.teams && Object.keys(data.teams).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.teams).map(([teamId, team]) => (
                <TeamCard key={teamId} teamId={teamId} team={team} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No teams found in this department.</p>
          )}
        </div>

        {/* OKRs Section */}
        {data.okrs.length > 0 && (
          <div ref={okrsRef}>
            <OkrTable okrs={data.okrs} />
          </div>
        )}
      </main>
    </AppLayout>
  );
}
