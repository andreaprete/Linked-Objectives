"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CompanyPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchCompany() {
      try {
        const res = await fetch(`/api/companies/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load company data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading Company...</p>;
  if (!data) return <p className="p-6 text-red-500">Failed to load company data.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Company: {data.name}</h1>

      {data.departments?.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Departments</h2>
          {data.departments.map((dept) => (
            <div key={dept.id} className="mb-6 border-b pb-4">
              <h3 className="text-xl font-medium mb-1">
                <Link href={`/departments/${dept.id}`} className="text-blue-600 hover:underline">
                  {dept.name}
                </Link>
              </h3>
              {dept.teams?.length > 0 && (
                <div className="pl-4">
                  <h4 className="font-semibold mb-1">Teams:</h4>
                  <ul className="list-disc ml-5">
                    {dept.teams.map((team) => (
                      <li key={team.id} className="mb-1">
                        <Link href={`/teams/${team.id}`} className="text-blue-600 hover:underline">
                          {team.name}
                        </Link>
                        {team.members?.length > 0 && (
                          <ul className="list-disc ml-5 mt-1 text-sm text-gray-700">
                            {team.members.map((person) => (
                              <li key={person.id}>
                                <Link href={`/people/${person.id}`} className="hover:underline">
                                  {person.name} ({person.roleTitle})
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.okrs?.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mt-8 mb-3">OKRs</h2>
          <ul className="list-disc ml-5 text-sm">
            {data.okrs.map((okr) => (
              <li key={okr.id}>
                <Link href={`/objectives/${okr.id}`} className="text-blue-600 hover:underline">
                  {okr.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
