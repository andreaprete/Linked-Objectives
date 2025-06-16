'use client';

import { useEffect, useState } from "react";
import { Users2 } from "lucide-react";
import AppLayout from "@/app/components/AppLayout";
import TeamsCardForList from "../components/TeamsCardForList";
import "@/app/styles/TeamsListPage.css";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teamslist", {
          cache: "no-store",
        });
        const json = await res.json();
        setTeams(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to load teams:", err);
        setTeams([]);
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

  return (
    <AppLayout>
      <div className="teams-content-container">
        {/* Title and Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          {/* Title with icon */}
          <div className="flex items-center gap-2">
            <Users2 className="text-blue-600" size={28} />
            <h1 className="text-2xl font-semibold text-blue-600">Teams</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Search by team name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full bg-gray-50"
                placeholder="e.g. Product Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Filter by department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full bg-gray-50"
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
        </div>

        {/* Team Cards */}
        {filteredTeams.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No teams match your criteria.
          </p>
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
// Note: Ensure that the API endpoint /api/teamslist is correctly set up to return the teams data in the expected format.