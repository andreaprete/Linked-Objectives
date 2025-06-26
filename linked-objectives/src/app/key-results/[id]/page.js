"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import AppLayout from "@/app/components/AppLayout";
import KeyResultHeader from "@/app/components/KeyResultHeader.js";
import ProgressBar from "@/app/components/ProgressBar.js";
import MetaInfo from "@/app/components/MetaInfo.js";
import DescriptionBox from "@/app/components/DescriptionBox.js";
import LinkedOkrCard from "@/app/components/LinkedOkrCard.js";
import EditKeyResultModal from "@/app/components/EditKeyResultModal.js";

export default function ObjectivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const [canEdit, setCanEdit] = useState(false);  

  useEffect(() => {
    if (!id || status !== "authenticated") return;

    async function fetchOkr() {
      try {
        const res = await fetch(`http://localhost:3000/api/key-results/${id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const json = await res.json();
        if (json.lifecycleStates && Array.isArray(json.lifecycleStates)) {
          setLifecycleStates(json.lifecycleStates);
        }

        const krData = json.data;
        setData(krData);

        // 👇 Permission logic
        const email = session.user.email;
        const role = session.user.role;

        const usernameRes = await fetch(`/api/getUsername?email=${email}`);
        const { username } = await usernameRes.json();

        const toArray = (val) => Array.isArray(val) ? val : val ? [val] : [];

        const involved = [
          ...toArray(krData?.linkedObjective?.accountableFor),
          ...toArray(krData?.linkedObjective?.caresFor),
          ...toArray(krData?.linkedObjective?.operates),
        ];

        const isInvolved = involved
          .map((u) => u.id?.toLowerCase())
          .includes(username?.toLowerCase());

        const isAdmin = role === "admin";
        setCanEdit(isAdmin || isInvolved);

      } catch (err) {
        console.error("Failed to load OKR data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOkr();
  }, [id, session, status]);


    if (loading) return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Key-Result data...</p>
          </div>
        </main>
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Update failed");
      setData((prev) => ({ ...prev, ...updatedData }));
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save updates:", err);
    }
  };
  return (
    <AppLayout>
      <div className="flex justify-center items-start bg-gray-100 pt-4 min-h-screen relative">    
        <div className={`transition-all duration-300 w-full max-w-[1200px] bg-white rounded-xl shadow p-8 space-y-6 mx-auto ${isModalOpen ? "blur-sm pointer-events-none select-none" : ""}`}>
          <KeyResultHeader
            title={data.title}
            comment={data.comment}
            setModalOpen={setModalOpen}
            canEdit={canEdit}
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
            averageProgress={data.linkedObjective?.averageProgress}
            id={data.isKeyResultOf}
            title={data.linkedObjective?.title}
            description={data.linkedObjective?.description}
            state={data.linkedObjective?.state}
            category={data.linkedObjective?.category}
          />
        </div>

        {/* Modal overlay - only inside main content area */}
        {isModalOpen && (
          <EditKeyResultModal
            initialData={data}
            lifecycleStates={lifecycleStates}
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </AppLayout>
  );
}