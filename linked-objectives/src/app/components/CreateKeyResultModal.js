"use client";

import { useState, useEffect } from "react";
import "@/app/styles/EditModal.css"; // reuse your modal styles

export default function CreateKeyResultModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    description: "",
  });

  // Add Escape key close logic
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return; // require a title
    await onCreate(formData);
    setFormData({ title: "", comment: "", description: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Create Key Result</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="input-label">
              Title <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="comment" className="input-label">Comment</label>
            <textarea
              name="comment"
              id="comment"
              value={formData.comment}
              onChange={handleChange}
              className="textarea-field"
              rows={2}
              placeholder="Comment"
            />
          </div>

          <div>
            <label htmlFor="description" className="input-label">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea-field"
              rows={4}
              placeholder="Description"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="save-button">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
