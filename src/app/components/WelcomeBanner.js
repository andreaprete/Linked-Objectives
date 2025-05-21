'use client';
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';

export function WelcomeBanner() {
const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`/api/people/${id}`);
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

  return (
    <div className="bg-white shadow p-4 rounded">
      <div className="flex items-center space-x-4">
        <img src={"/avatar.png"} className="w-12 h-12 rounded-full" />
        <div>
          {data && (<h2 className="text-lg font-semibold"> Welcome back, {data.name}!</h2>)}
          <div className="text-sm text-blue-600 space-x-2">
            <a href= {`/people/${id}`}>View Profile</a>
          </div>
        </div>
      </div>
    </div>
  );
}