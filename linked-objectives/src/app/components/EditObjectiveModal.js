"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import "@/app/styles/EditObjectiveModal.css";

export default function EditObjectiveModal({ initialData, onClose, onSave }) {
  const [people, setPeople] = useState([]);
  const [availableOKRs, setAvailableOKRs] = useState([]);
  const [newOkrId, setNewOkrId] = useState("");
  const [newOkrRelation, setNewOkrRelation] = useState("needs");

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    comment: initialData.comment || "",
    description: initialData.description || "",
    progress: initialData.progress ?? 0,
    temporal: initialData.temporal || {},
    type: initialData.category || "tactical",
    version: initialData.version || "",
    accountableFor: initialData.accountableFor?.id || "",
    caresFor: initialData.caresFor?.id || "",
    operates: initialData.operates?.id || "",
    relatedOKRs: [],
  });

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [peopleRes, okrsRes] = await Promise.all([
          fetch("/api/peoplelist"),
          fetch("/api/objectiveslist"),
        ]);
        const peopleData = await peopleRes.json();
        const okrsData = await okrsRes.json();

        const related = [];
        for (const relType of [
          "contributesTo",
          "neededBy",
          "needs",
          "contributedToBy",
        ]) {
          if (initialData[relType]) {
            initialData[relType].forEach((id) => {
              const match = okrsData.find((o) => o.id === id);
              related.push({
                id,
                title: match?.title || id,
                relation: relType,
              });
            });
          }
        }

        setPeople(peopleData);
        setAvailableOKRs(okrsData);

        setFormData((prev) => ({
          ...prev,
          relatedOKRs: related,
        }));
      } catch (err) {
        console.error("Error loading dropdown data:", err);
      }
    }

    fetchInitialData();
  }, [initialData]);


  useEffect(() => {
    if (!onClose) return; // Defensive in case onClose isn't passed
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const personOptions = people.map((p) => ({ label: p.name, value: p.id }));

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name.includes("temporal.") ? "temporal" : name]: name.includes(
        "temporal."
      )
        ? { ...prev.temporal, [name.split(".")[1]]: value }
        : value,
    }));
  };

  const updateOkrRelation = (index, relation) => {
    const updated = [...formData.relatedOKRs];
    updated[index].relation = relation;
    setFormData({ ...formData, relatedOKRs: updated });
  };

  const removeOkr = (index) => {
    const updated = [...formData.relatedOKRs];
    updated.splice(index, 1);
    setFormData({ ...formData, relatedOKRs: updated });
  };

  const addNewOkr = () => {
    if (!newOkrId || !newOkrRelation) return;
    const okr = availableOKRs.find((o) => o.id === newOkrId);
    if (!okr) return;
    setFormData((prev) => ({
      ...prev,
      relatedOKRs: [
        ...prev.relatedOKRs,
        { id: okr.id, title: okr.title, relation: newOkrRelation },
      ],
    }));
    setNewOkrId("");
    setNewOkrRelation("needs");
  };

  const handleSubmit = async () => {
    const resolved = {
      ...formData,
      accountableFor: people.find((p) => p.id === formData.accountableFor),
      caresFor: people.find((p) => p.id === formData.caresFor),
      operates: people.find((p) => p.id === formData.operates),
    };
    await onSave(resolved);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Edit Objective</h2>

        <label className="input-label">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field"
        />

        <label className="input-label">Progress</label>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${formData.progress}%` }}
          ></div>
          <span className="progress-text">{formData.progress}%</span>
        </div>

        <label className="input-label">Comment</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          className="textarea-field"
        />

        <label className="input-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="textarea-field"
        />

        <div className="grid-two-cols">
          <div>
            <label className="input-label">Start Date</label>
            <input
              type="date"
              name="temporal.start"
              value={formatDate(formData.temporal.start)}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">End Date</label>
            <input
              type="date"
              name="temporal.end"
              value={formatDate(formData.temporal.end)}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid-two-cols">
          <div>
            <label className="input-label">Version</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="tactical">Tactical</option>
              <option value="strategic">Strategic</option>
              <option value="operational">Operational</option>
            </select>
          </div>
        </div>

        <div className="grid-three-cols">
          {["accountableFor", "operates", "caresFor"].map((role) => (
            <div key={role}>
              <label className="input-label">
                {role.replace(/([A-Z])/g, " $1")}
              </label>
              <Select
                options={personOptions}
                value={personOptions.find(
                  (opt) => opt.value === formData[role]
                )}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    [role]: selected?.value || "",
                  }))
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "2rem",
                    height: "2rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
                isSearchable
              />
            </div>
          ))}
        </div>

        <div className="modal-section related-okrs-wrapper">
          <h3 className="input-label">Related OKRs</h3>
          {formData.relatedOKRs.map((okr, index) => (
            <div key={okr.id || index} className="okr-row">
              <span className="okr-title">{okr.title}</span>
              <select
                value={okr.relation}
                onChange={(e) => updateOkrRelation(index, e.target.value)}
                className="relation-select"
              >
                <option value="needs">Needs</option>
                <option value="neededBy">Needed By</option>
                <option value="contributesTo">Contributes To</option>
                <option value="contributedToBy">Contributed To By</option>
              </select>
              <button onClick={() => removeOkr(index)} className="delete-btn">
                ✖
              </button>
            </div>
          ))}

          <div className="add-okr-row">
            <select
              value={newOkrId}
              onChange={(e) => setNewOkrId(e.target.value)}
              className="select-field"
            >
              <option value="">-- Select OKR --</option>
              {availableOKRs.map((okr) => (
                <option key={okr.id} value={okr.id}>
                  {okr.title}
                </option>
              ))}
            </select>
            <select
              value={newOkrRelation}
              onChange={(e) => setNewOkrRelation(e.target.value)}
              className="select-field"
            >
              <option value="needs">Needs</option>
              <option value="neededBy">Needed By</option>
              <option value="contributesTo">Contributes To</option>
              <option value="contributedToBy">Contributed To By</option>
            </select>
            <button onClick={addNewOkr} className="add-btn">
              ＋
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSubmit} className="save-button">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
