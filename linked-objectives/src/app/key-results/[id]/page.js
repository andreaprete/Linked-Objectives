'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import AppLayout from '@/app/components/AppLayout'; // Unified layout
import KeyResultHeader from '@/app/components/KeyResultHeader.js';
import ProgressBar from '@/app/components/ProgressBar.js';
import MetaInfo from '@/app/components/MetaInfo.js';
import DescriptionBox from '@/app/components/DescriptionBox.js';
import LinkedOkrCard from '@/app/components/LinkedOkrCard.js';
import EditModal from '@/app/components/EditModal.js';

import styles from '@/app/styles/KeyResult.css';

export default function ObjectivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`http://localhost:3000/api/key-results/${id}`);
        const json = await res.json();
        if (json.lifecycleStates && Array.isArray(json.lifecycleStates)) {
          setLifecycleStates(json.lifecycleStates);
        }
        setData(json.data);
      } catch (err) {
        console.error('Failed to load OKR data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOkr();
  }, [id]);

  if (loading)
    return (
      <AppLayout>
        <div className="p-6 text-lg">Loading Key Result...</div>
      </AppLayout>
    );
  if (!data || Object.keys(data).length === 0)
    return (
      <AppLayout>
        <div className="p-6 text-red-500">Failed to load Key Result.</div>
      </AppLayout>
    );

  const handleSave = async (updatedData) => {
    try {
      const res = await fetch(`/api/key-results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error('Update failed');
      setData((prev) => ({ ...prev, ...updatedData }));
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save updates:', err);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-center items-start bg-gray-100 pt-4 min-h-screen">
        <div className="bg-white rounded-xl shadow p-8 space-y-6 max-w-5xl w-full">
          <KeyResultHeader
            title={data.title}
            comment={data.comment}
            setModalOpen={setModalOpen}
          />
          <div className="flex space-x-6">
            <div className="flex-3">
              <ProgressBar progress={data.progress} state={data.state} />
            </div>
            <div className="flex-1">
              <MetaInfo created={data.created} modified={data.modified} />
            </div>
          </div>
          <DescriptionBox description={data.description} />
          <LinkedOkrCard
            progress={data.linkedObjective?.progress}
            id={data.isKeyResultOf}
            title={data.linkedObjective?.title}
            description={data.linkedObjective?.description}
            state={data.linkedObjective?.state}
            category={data.linkedObjective?.category}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-portal">
          <div className="modal-wrapper">
            <div className="modal-inside-layout">
              <EditModal
                initialData={data}
                lifecycleStates={lifecycleStates}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
