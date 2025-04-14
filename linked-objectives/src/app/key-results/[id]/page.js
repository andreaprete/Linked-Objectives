'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ObjectivePage() {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`http://localhost:3000/api/objectives/${id}`);
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

  if (loading) return <p className="p-6 text-lg">Loading OKR...</p>;
  if (!data) return <p className="p-6 text-red-500">Failed to load OKR.</p>;

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
      </div>
    </div>
  );
}
