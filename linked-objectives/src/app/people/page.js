"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/app/components/AppLayout";
import PeopleHeader from "@/app/components/PeopleHeader";
import PersonCard from "@/app/components/PersonCard";
import "@/app/styles/Peoplelist.css";

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchPeople() {
      const res = await fetch("/api/peoplelist", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const rawData = await res.json();

      // Group entries by person.id
      const merged = new Map();

      for (const entry of rawData) {
        if (!merged.has(entry.id)) {
          merged.set(entry.id, {
            id: entry.id,
            name: entry.name,
            roles: entry.role ? [entry.role] : [],
            teams: entry.team ? [{ name: entry.team, id: entry.teamId }] : [],
            department: entry.department,
            company: entry.company,
            objectiveCount: entry.objectiveCount ?? 0,
          });
        } else {
          const existing = merged.get(entry.id);

          // Add role if not already included
          if (entry.role && !existing.roles.includes(entry.role)) {
            existing.roles.push(entry.role);
          }

          // Add team if not already included
          if (
            entry.team &&
            !existing.teams.some((t) => t.name === entry.team)
          ) {
            existing.teams.push({ name: entry.team, id: entry.teamId });
          }

          // Sum objective counts
          existing.objectiveCount += entry.objectiveCount ?? 0;
        }
      }

      setPeople(Array.from(merged.values()));
      setLoading(false);
    }

    fetchPeople();
  }, []);

  const filtered = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading People List...</p>
          </div>
        </main>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="people-list-bg min-h-screen py-8 flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 space-y-6">
          <PeopleHeader
            count={people.length}
            search={search}
            setSearch={setSearch}
          />
          {loading ? (
            <div className="people-list-loading">Loading people...</div>
          ) : filtered.length === 0 ? (
            <div className="people-list-empty">No people found.</div>
          ) : (
            <>
              <div className="people-list-grid">
                {filtered.slice(0, visibleCount).map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div
                  className="people-list-more"
                  onClick={() => setVisibleCount((v) => v + 12)}
                >
                  Show More...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
