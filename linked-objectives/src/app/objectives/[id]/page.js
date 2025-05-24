'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ObjectivePage() {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`/api/objectives/${id}`);
        const json = await res.json();
        console.log('Fetched OKR data:', json.data);
        setData(json.data);
      } catch (err) {
        console.error('Failed to load OKR data:', err);
      } finally {
        setLoading(false);
      }
    }

    
    fetchOkr();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading OKR...</p>;
  if (!data || Object.keys(data).length === 0)
    return <p className="p-6 text-red-500">Failed to load OKR.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <p className="text-gray-700 italic mb-4">{data.comment}</p>
      <div className="space-y-2 text-sm text-gray-800">
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Category:</strong> {data.category}</p>
        <p><strong>State:</strong> {data.state}</p>
        <p><strong>Created:</strong> {data.created}</p>
        <p><strong>Modified:</strong> {data.modified}</p>
        <p><strong>Version:</strong> {data.version}</p>
        <p><strong>Type:</strong> {data.type}</p>
        <p><strong>Accountable for:</strong> {data.accountableFor}</p>
        <p><strong>Cares for:</strong> {data.caresFor}</p>
        <p><strong>Operates:</strong> {data.operates}</p>
        <p><strong>Temporal:</strong> {data.temporal}</p>
        <p><strong>Key Results:</strong></p>
          <ul className="list-disc pl-5">
            {data.keyResult?.map((id) => (
              <li key={id}>
                <Link
                  href={`/key-results/${id}`}
                  className="text-blue-600 hover:underline"
                >
                  {id}
                </Link>
              </li>
            ))}
          </ul>
        <p><strong>Contributes to:</strong></p>
          <ul className="list-disc pl-5">
            {data.contributesTo?.map((id) => (
              <li key={id}>
                <Link
                  href={`/objectives/${id}`}
                  className="text-blue-600 hover:underline"
                >
                  {id}
                </Link>
              </li>
            ))}
          </ul>
        <p><strong>Has formal responsibility for:</strong></p>
          <ul className="list-disc pl-5">
            {data.hasFormalResponsibilityFor?.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        <p><strong>Has responsibility for:</strong></p>
          <ul className="list-disc pl-5">
            {data.hasResponsibilityFor?.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        <p><strong>Needs:</strong></p>
        <ul className="list-disc pl-5">
            {data.needs?.map((id) => (
              <li key={id}>
                <Link
                  href={`/objectives/${id}`}
                  className="text-blue-600 hover:underline"
                >
                  {id}
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}
