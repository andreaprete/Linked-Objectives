"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/app/components/AppLayout";
import KeyResults from "../../components/KeyResults";
import RelatedGraph from "../../components/RelatedGraph";
import PeopleInvolved from "../../components/PeopleInvolved";
import "@/app/styles/ObjectivesPage.css";
import SemiCircleProgress from "../../components/SemiCircleProgressProps";
import EditObjectiveModal from "../../components/EditObjectiveModal";

export default function ObjectivePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("keyResults");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchObjective() {
      const res = await fetch(`/api/objectives/${id}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const json = await res.json();
      setData(json.data);
      setLoading(false);
    }
    fetchObjective();
  }, [id]);

  const handleSave = async (updatedData) => {
    try {
      const res = await fetch(`/api/objectives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Update failed");

      setData((prev) => ({ ...prev, ...updatedData }));
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to update objective:", err);
      alert("Failed to update objective.");
    }
  };

  if (loading)
    return (
      <AppLayout>
        <div className="p-6 text-lg">Loading...</div>
      </AppLayout>
    );
  if (!data)
    return (
      <AppLayout>
        <div className="p-6 text-red-500">Failed to load data.</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="relative">
        {/* Modal */}
        {showEdit && (
          <div className="modal-overlay">
            <div className="modal-container">
              <EditObjectiveModal
                initialData={data}
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                onSave={handleSave}
              />
            </div>
          </div>
        )}

        {/* Blurred content */}
        <div
          className={`transition-all duration-300 ${
            showEdit ? "blur-sm pointer-events-none select-none" : ""
          }`}
        >
          <div className="objective-container">
            <div className="objective-card">
              <div className="objective-header-section row-layout">
                <div className="objective-left-meta">
                  <h1 className="objective-title">{data.title}</h1>
                  <p className="objective-comment">{data.comment}</p>
                  <div className="objective-meta">
                    <span>
                      <strong>Created:</strong> {data.created}
                    </span>
                    <span>
                      <strong>Version:</strong> {data.version}
                    </span>
                    <span>
                      <strong>Modified:</strong> {data.modified}
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
                  <div className="edit-button-container">
                    <button
                      onClick={() => setShowEdit(true)}
                      className="edit-button"
                    >
                      EDIT
                    </button>
                  </div>
                  <SemiCircleProgress
                    strokeWidth={8}
                    percentage={data.progress || 0}
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

            <div className="objective-tabs">
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

            {activeTab === "keyResults" && <KeyResults ids={data.keyResult || []} />}
            {activeTab === "related" && data && <RelatedGraph data={data} />}
            {activeTab === "people" && (
              <>
                <PeopleInvolved label="Accountable for" people={data.accountableFor} />
                <PeopleInvolved label="Cares for" people={data.caresFor} />
                <PeopleInvolved label="Operates" people={data.operates} />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
