"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/app/components/AppLayout";
import KeyResults from "../../components/KeyResults";
import RelatedGraph from "../../components/RelatedGraph";
import PeopleInvolved from "../../components/PeopleInvolved";
import "@/app/styles/ObjectivesPage.css";
import SemiCircleProgress from "../../components/SemiCircleProgressProps";
import EditObjectiveModal from "../../components/EditObjectiveModal";
import CreateKeyResultModal from "@/app/components/CreateKeyResultModal";

export default function ObjectivePage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("keyResults");
  const [showEdit, setShowEdit] = useState(false);
  const [selectedKeyResults, setSelectedKeyResults] = useState([]);
  const [showCreateKR, setShowCreateKR] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchObjectiveAndCheckEditPermission() {
      try {
        if (!session?.user?.email) return;

        const res = await fetch(`/api/objectives/${id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const obj = json.data;

        const keyResultIds = obj.keyResult || [];
        const keyResults = await Promise.all(
          keyResultIds.map(async (krId) => {
            const krRes = await fetch(`/api/key-results/${krId}`, {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
            });
            const krJson = await krRes.json();
            return parseFloat(krJson.data?.progress || 0);
          })
        );

        const total = keyResults.reduce((acc, val) => acc + val, 0);
        const averageProgress = keyResults.length > 0 ? total / keyResults.length : 0;
        obj.averageProgress = averageProgress;

        setData(obj);

        const usernameRes = await fetch(`/api/getUsername?email=${session.user.email}`);
        const usernameJson = await usernameRes.json();
        const username = usernameJson.username;
        const role = session.user.role;

        const toArray = (val) => Array.isArray(val) ? val : val ? [val] : [];

        const involvedUsernames = [
          ...toArray(obj.accountableFor),
          ...toArray(obj.caresFor),
          ...toArray(obj.operates),
        ];

        const isInvolved = involvedUsernames
          .map((u) => u.id.toLowerCase())
          .includes(username?.toLowerCase());

        const isAdmin = role === "admin";
        setCanEdit(isAdmin || (role === "user" && isInvolved));

      } catch (err) {
        console.error("Failed to fetch objective or permissions:", err);
        alert("Failed to load objective data. Please try again later.");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchObjectiveAndCheckEditPermission();
  }, [id, session, status]);

  if (status === "loading") {
    return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Checking session...</p>
        </main>
      </AppLayout>
    );
  }

  
  const handleSave = async (updatedData) => {
    try {
      const res = await fetch(`/api/objectives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Update failed");

      window.location.reload();
    } catch (err) {
      alert("Failed to update objective.");
    }
  };

  const handleCreateKeyResult = async (formData) => {
    try {
      const res = await fetch(`/api/objectives/${id}/key-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        alert("Failed to create key result: " + errMsg); // <--- Show the backend error!
        throw new Error(errMsg);
      }
      setShowCreateKR(false);
      window.location.reload();
    } catch (err) {
      alert("Failed to create key result: " + (err?.message || "(no error details)"));
      console.error("Failed to create key result:", err);
    }
  };

  // DELETE handler
  async function handleDeleteKeyResults() {
    if (!selectedKeyResults.length) return;
    if (!window.confirm(`Delete ${selectedKeyResults.length} key result(s)?`)) return;

    try {
      const res = await fetch(`/api/objectives/${id}/key-results`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ krIds: selectedKeyResults }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      window.location.reload();
    } catch (err) {
      alert("Failed to delete key result(s).");
    }
  }

  if (loading || !data) {
    return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Objective data...</p>
          </div>
        </main>
      </AppLayout>
    );
  }
  
  if (!loading && status === "authenticated" && data === null) {
    return (
      <AppLayout>
        <div className="p-6 text-red-500">Failed to load data.</div>
      </AppLayout>
    );
  }

  const formatDate = (value) => {
    if (!value || value === "undefined") return "undefined";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value));
    } catch {
      return "undefined";
    }
  };

  // If either modal is open, apply blur classes to page content.
  const isAnyModalOpen = showEdit || showCreateKR;

  return (
    <AppLayout>
      {/* Outer content area, must be relative! */}
      <div className="flex justify-center items-start bg-gray-100 pt-4 min-h-screen relative">
        {/* Main content (gets blurred if modal is open) */}
        <div className={`objective-container transition-all duration-300 ${isAnyModalOpen ? "blur-sm pointer-events-none select-none" : ""}`}>
          <div className="objective-card">
            <div className="objective-header-section row-layout">
              <div className="objective-left-meta">
                <h1 className="objective-title">{data.title}</h1>
                <p className="objective-comment">{data.comment}</p>
                <div className="objective-meta">
                  <span>
                    <strong>Created:</strong> {formatDate(data.created)}
                  </span>
                  <span>
                    <strong>Version:</strong> {data.version}
                  </span>
                  <span>
                    <strong>Modified:</strong> {formatDate(data.modified)}
                  </span>
                </div>
                <div className="objective-category-row">
                  <span>
                    <span className="label">Category:</span>
                    <span className="temporal-text"> {data.category}</span>
                  </span>
                  <span>
                    <span className="label status-label">State:</span>
                    <span className="state"> {data.state}</span>
                  </span>
                </div>
                <div className="temporal-timeline">
                  <div className="temporal-labels">
                    <span className="temporal-date">{data.temporal?.start}</span>
                    <span className="temporal-date">{data.temporal?.end}</span>
                  </div>
                  <div className="temporal-line">
                    <span className="dot"></span>
                    <span className="connector"></span>
                    <span className="dot"></span>
                  </div>
                  <div className="temporal-labels">
                    <span className="temporal-text">Beginning Date</span>
                    <span className="temporal-text">End Date</span>
                  </div>
                </div>
              </div>
              <div className="objective-progress-visual">
                {canEdit && (
                  <div className="edit-button-container">
                    <button
                      onClick={() => setShowEdit(true)}
                      className="edit-button"
                    >
                      EDIT
                    </button>
                  </div>
                )}
                <SemiCircleProgress
                  strokeWidth={8}
                  averageProgress={data.averageProgress || 0}
                  strokeColor="#3b82f6"
                  size={{ width: 200, height: 130 }}
                  hasBackground={true}
                />
              </div>
            </div>
            <div className="objective-description-box">
              <p className="label">Description:</p>
              <p className="objective-description">{data.description}</p>
            </div>
          </div>
          {/* Tabs with Create/Delete buttons on the right */}
          <div className="objective-tabs" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setActiveTab("keyResults")}
                className={`tab-btn ${activeTab === "keyResults" ? "active" : ""}`}
              >
                Key results
              </button>
              <button
                onClick={() => setActiveTab("related")}
                className={`tab-btn ${activeTab === "related" ? "active" : ""}`}
              >
                Related OKRs
              </button>
              <button
                onClick={() => setActiveTab("people")}
                className={`tab-btn ${activeTab === "people" ? "active" : ""}`}
              >
                People Involved
              </button>
            </div>

            {/* Only show Create KR & Delete KR on the Key Results tab */}
            {activeTab === "keyResults" && canEdit && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowCreateKR(true)}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "0.4rem",
                    fontWeight: "500",
                    padding: "0.45rem 1.2rem",
                    cursor: "pointer"
                  }}
                >
                  Create KR
                </button>
                <button
                  onClick={handleDeleteKeyResults}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "0.4rem",
                    fontWeight: "500",
                    padding: "0.45rem 1.2rem",
                    cursor: "pointer"
                  }}
                  disabled={selectedKeyResults.length === 0}
                  title={selectedKeyResults.length === 0 ? "Select at least one key result" : ""}
                >
                  Delete KR
                </button>
              </div>
            )}
          </div>

          {activeTab === "keyResults" &&
            Array.isArray(data?.keyResult) &&
            data.keyResult.length > 0 &&
            mounted && ( // ✅ render only after mount
              <KeyResults
                key={data.keyResult.join("-")}
                ids={data.keyResult}
                onSelectionChange={setSelectedKeyResults}
              />
          )}
          {activeTab === "related" && <RelatedGraph data={data} />}
          {activeTab === "people" && (
            <>
              <PeopleInvolved label="Accountable for" people={data.accountableFor} />
              <PeopleInvolved label="Cares for" people={data.caresFor} />
              <PeopleInvolved label="Operates" people={data.operates} />
            </>
          )}
        </div>

        {/* === Modal overlays – for Edit and Create Key Result === */}
        {showEdit && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-8 mt-10">
              <EditObjectiveModal
                initialData={data}
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                onSave={handleSave}
              />
            </div>
          </div>
        )}
        {showCreateKR && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-8 mt-10">
              <CreateKeyResultModal
                isOpen={showCreateKR}
                onClose={() => setShowCreateKR(false)}
                onCreate={handleCreateKeyResult}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
