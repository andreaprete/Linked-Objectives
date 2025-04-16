'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PersonPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchPerson() {
      try {
        const res = await fetch(`http://localhost:3001/api/people/${id}`);
        const json = await res.json();
        setData(json.data);
        setOkrs(json.okrs || []);
      } catch (err) {
        console.error('Failed to load person data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPerson();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading profile...</p>;
  if (!data) return <p className="p-6 text-red-500">Person not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <p className="text-sm text-gray-600">{data.email} • {data.username}</p>
        <p className="text-sm text-gray-600">Location: {data.location}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">Role & Organization</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          <li><strong>Post:</strong> {data.post}</li>
          <li><strong>Role Title:</strong> {data.roleTitle}</li>
          <li><strong>Team:</strong> {data.teamName} ({data.team})</li>
          <li><strong>Department:</strong> {data.departmentName} ({data.department})</li>
          <li><strong>Company:</strong> {data.company}</li>
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">Linked OKRs</h2>
        {okrs.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
            {okrs.map((okr) => (
              <li key={okr.id}>
                <a href={`/objectives/${okr.id}`} className="text-blue-600 hover:underline">
                  {okr.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No OKRs linked to this post.</p>
        )}
      </div>
    </div>
  );
}
