'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import KeyResultHeader from '@/components/KeyResultHeader.jsx';
import ProgressBar from '@/components/ProgressBar.jsx';
import MetaInfo from '@/components/MetaInfo.jsx';
import DescriptionBox from '@/components/DescriptionBox.jsx';
import LinkedOkrCard from '@/components/LinkedOkrCard.jsx';
import SidebarLayout from '@/components/SidebarLayout.jsx';
import EditModal from '@/components/EditModal.jsx'; // Ensure this import is included

export default function ObjectivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

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

  const handleSave = async (updatedData) => {
    try {
      const res = await fetch(`/api/key-results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      if (!res.ok) throw new Error('Update failed');
  
      // Optionally refetch data to reflect updates
      setData((prev) => ({ ...prev, ...updatedData }));
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save updates:', err);
    }
  };

  return (
    <>
      <SidebarLayout title={data.linkedObjective?.title || 'Objective'} id={data.isKeyResultOf} blur={isModalOpen}>
        <div className="flex justify-center items-start bg-gray-100 pt-4">
          <div className="bg-white rounded-xl shadow p-8 space-y-6 max-w-5xl w-full">
            <KeyResultHeader
              title={data.title}
              comment={data.comment}
              setModalOpen={setModalOpen}
            />
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
              progress={data.linkedObjective?.progress}
              id={data.isKeyResultOf}
              title={data.linkedObjective?.title}
              description={data.linkedObjective?.description}
              state={data.linkedObjective?.state}
              category={data.linkedObjective?.category}
            />
          </div>
        </div>
      </SidebarLayout>
  
      {isModalOpen && (
        <>
          {/* Blurring overlay */}
          <style jsx global>{`
            .layout-content {
              filter: blur(6px);
              pointer-events: none;
              user-select: none;
            }
          `}</style>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <EditModal
              initialData={data}
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleSave}
            />
          </div>
        </>
      )}
    </>
  );
}
