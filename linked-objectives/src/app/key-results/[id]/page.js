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
        const res = await fetch(`http://localhost:3000/api/key-results/${id}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error('Failed to load OKR data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOkr();
  }, [id]);

  if (loading) return <p className="p-6 text-lg">Loading Key Result...</p>;
  if (!data || Object.keys(data).length === 0)
    return <p className="p-6 text-red-500">Failed to load Key Result.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <p className="text-gray-700 italic mb-4">{data.comment}</p>
      <div className="space-y-2 text-sm text-gray-800">
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>State:</strong> {data.state}</p>
        <p><strong>Created:</strong> {data.created}</p>
        <p><strong>Modified:</strong> {data.modified}</p>
        <p><strong>Progress:</strong> {data.progress}</p>
        <p><strong>Is part of:</strong> {
          data.isPartOf?.map((id) => (
            <Link
              key={id}
              href={`/objectives/${id}`}
              className="text-blue-600 hover:underline ml-1"
            >
              {id}
            </Link>
          ))
        }</p>
        <p><strong>Is key result of:</strong> {
          data.isKeyResultOf?.map((id) => (
            <Link
              key={id}
              href={`/objectives/${id}`}
              className="text-blue-600 hover:underline ml-1"
            >
              {id}
            </Link>
          ))
        }</p>
      </div>
    </div>
  );
}
