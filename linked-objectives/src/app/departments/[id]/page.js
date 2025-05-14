'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DepartmentPage() {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchDepartment() {
      try {
        const res = await fetch(`/api/departments/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load department data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartment();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading Department...</p>;
  if (!data) return <p className="p-6 text-red-500">Failed to load department.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{data.department}</h1>
      <p className="text-gray-500 mb-6">Company: <Link className="text-blue-600 hover:underline" href={`/companies/${data.company}`}>{data.company}</Link></p>

      <h2 className="text-xl font-semibold mb-4">Teams</h2>
      {Object.entries(data.teams).map(([teamId, team]) => (
        <div key={teamId} className="mb-4 border p-4 rounded-md">
          <Link href={`/teams/${teamId}`}>
            <h3 className="text-lg font-bold hover:underline">{team.name}</h3>
          </Link>
          {team.members.map((person) => (
            <p key={person.id}>
              <Link href={`/people/${person.id}`} className="text-blue-600 hover:underline">
                {person.name}
              </Link>{" "}
              – {person.roleTitle} ({person.username}, {person.location})
            </p>
          ))}
        </div>
      ))}

      {data.okrs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-4">Related OKRs</h2>
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
