"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeamPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load team data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading Team...</p>;
  if (!data) return <p className="p-6 text-red-500">Failed to load team.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
      <p className="text-gray-500 mb-6">
        Department: <Link href={`/departments/${data.department}`} className="text-blue-600 hover:underline">{data.department}</Link>
      </p>

      <h2 className="text-lg font-semibold mb-2">Members</h2>
      <div className="space-y-2">
        {data.members.map((person) => (
          <p key={person.id}>
            <Link href={`/people/${person.id}`} className="text-blue-600 hover:underline">
              {person.name}
            </Link>{" "}
            – {person.roleTitle} ({person.username}, {person.location})
          </p>
        ))}
      </div>

      {data.okrs?.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Related OKRs</h2>
          <ul className="list-disc pl-6 text-sm">
            {data.okrs.map((okr) => (
              <li key={okr.id}>
                <Link href={`/objectives/${okr.id}`} className="text-blue-600 hover:underline">
                  {okr.label} (ID: {okr.id})
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
