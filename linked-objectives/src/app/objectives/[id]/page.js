"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/app/components/AppLayout"; // unified layout
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
      try {
        const res = await fetch(`/api/objectives/${id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const json = await res.json();
        const obj = json.data;

        // 🔍 Fetch key result progress values
        const keyResultIds = obj.keyResult || [];
        const keyResults = await Promise.all(
          keyResultIds.map(async (krId) => {
            const res = await fetch(`/api/key-results/${krId}`);
            const json = await res.json();
            return parseFloat(json.data?.progress || 0);
          })
        );

        // 🧮 Calculate average
        const total = keyResults.reduce((acc, val) => acc + val, 0);
        const averageProgress =
          keyResults.length > 0 ? total / keyResults.length : 0;

        obj.averageProgress = averageProgress;

        setData(obj);
      } catch (err) {
        console.error("Error loading objective or key results:", err);
      } finally {
        setLoading(false);
      }
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
      <div className="objective-container">
        {showEdit && (
          <div className="modal-portal">
            <div className="modal-wrapper">
              <div className="modal-inside-layout">
                <EditObjectiveModal
                  initialData={data}
                  isOpen={showEdit}
                  onClose={() => setShowEdit(false)}
                  onSave={handleSave}
                />
              </div>
            </div>
          </div>
        )}

        <div className="objective-card">
          <div className="objective-header-section row-layout">
            <div className="objective-left-meta">
              <h1 className="objective-title">{data.title}</h1>
              <p className="objective-comment">{data.comment}</p>
              <div className="objective-meta">
                <span>
                  <strong>Created:</strong>{" "}
                  {data.created && data.created !== "undefined"
                    ? new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(data.created))
                    : "undefined"}
                </span>
                <span>
                  <strong>Version:</strong> {data.version}
                </span>
                <span>
                  <strong>Modified:</strong>{" "}
                  {data.modified
                    ? new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(data.modified))
                    : "undefined"}
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

        {activeTab === "keyResults" && (
          <KeyResults ids={data.keyResult || []} />
        )}
        {activeTab === "related" && data && <RelatedGraph data={data} />}
        {activeTab === "people" && (
          <>
            <PeopleInvolved
              label="Accountable for"
              people={data.accountableFor}
            />
            <PeopleInvolved label="Cares for" people={data.caresFor} />
            <PeopleInvolved label="Operates" people={data.operates} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
