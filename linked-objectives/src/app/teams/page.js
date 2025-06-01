"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/app/components/AppLayout";
import TeamsCardForList from "../components/TeamsCardForList";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teamslist");
        const json = await res.json();
        setTeams(Array.isArray(json) ? json : []); // ensure it's an array
      } catch (err) {
        console.error("Failed to load teams:", err);
        setTeams([]); // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesDepartment = departmentFilter
      ? team.department === departmentFilter
      : true;
    return matchesSearch && matchesDepartment;
  });

  const uniqueDepartments = Array.isArray(teams)
    ? Array.from(
        new Set(teams.map((t) => t.department).filter(Boolean))
      )
    : [];

  // --- Loading UI, BEFORE the main return ---
  if (loading) {
    return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading teams...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  // --- Main page content ---
  return (
    <AppLayout>
      <div className="p-3 space-y-3">
        <div className="flex space-x-4 items-end justify-end">
          <div>
            <label className="block text-sm font-medium mb-1">
              Search by team name
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
              placeholder="e.g. Product Team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Filter by department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="">All</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <p className="text-gray-500">No teams match your criteria.</p>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <TeamsCardForList key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
