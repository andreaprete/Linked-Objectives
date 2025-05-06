'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import KeyResultHeader from '@/components/KeyResultHeader.jsx';
import ProgressBar from '@/components/ProgressBar.jsx';
import MetaInfo from '@/components/MetaInfo.jsx';
import DescriptionBox from '@/components/DescriptionBox.jsx';
import LinkedOkrCard from '@/components/LinkedOkrCard.jsx';
import SidebarLayout from '@/components/SidebarLayout.jsx';

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
    <SidebarLayout
      title={data.linkedObjective?.title || 'Objective'}
      id={data.isKeyResultOf}
    >
      <div className="flex justify-center items-start bg-gray-100 pt-4">
        <div className="bg-white rounded-xl shadow p-8 space-y-6 max-w-5xl w-full">
          <KeyResultHeader title={data.title} comment={data.comment} />
          <div className="flex space-x-6">
            <div className="flex-3">
              <ProgressBar progress={data.progress} />
            </div>
            <div className="flex-1">
              <MetaInfo created={data.created} modified={data.modified} />
            </div>
          </div>
          <DescriptionBox description={data.description} />
          <LinkedOkrCard
            progress={data.progress * 10}
            id={data.isKeyResultOf}
            title={data.linkedObjective?.title}
            description={data.linkedObjective?.description}
            state={data.linkedObjective?.state}
            category={data.linkedObjective?.category}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
