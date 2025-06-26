'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/20/solid';
import '@/app/styles/EditModal.css';

/* ── hard-coded lifecycle options ── */
const LIFECYCLE_OPTIONS = [
  'Draft','Idea','Planned','InProgress','Evaluating','Approved','Released',
  'Completed','Archived','Aborted','Deprecated','Rejected',
  'OnHold','Cancelled','Withdrawn'
].map((v) => ({ value: v, label: v }));

/* ── tint helper ── */
const stateColor = (s) => {
  switch (s) {
    case 'Draft':
    case 'Idea':
    case 'Planned':           return '#3b82f6';  // blue
    case 'Evaluating':
    case 'Approved':
    case 'Released':          return '#8b5cf6';  // purple
    case 'InProgress':
    case 'Completed':
    case 'Archived':          return '#10b981';  // green
    case 'Aborted':
    case 'Withdrawn':
    case 'Rejected':
    case 'Cancelled':         return '#ef4444';  // red
    case 'OnHold':
    case 'Deprecated':        return '#f59e0b';  // orange
    default:                  return '#6b7280';  // gray
  }
};

export default function EditModal({ initialData, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState(initialData);

  /* esc-to-close */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  const fmt = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Edit Key Result</h2>

        {/* title & progress */}
        <div className="grid-two-cols">
          <div>
            <label className="input-label" htmlFor="title">Title</label>
            <input
              name="title" id="title"
              value={formData.title} onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label" htmlFor="progress">
              Progress: {formData.progress}%
            </label>
            <input
              type="range" min="0" max="100"
              name="progress" id="progress"
              value={formData.progress} onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* comment / description */}
        <label className="input-label" htmlFor="comment">Comment</label>
        <textarea
          name="comment" id="comment" rows={2}
          value={formData.comment} onChange={handleChange}
          className="textarea-field"
        />

        <label className="input-label" htmlFor="description">Description</label>
        <textarea
          name="description" id="description" rows={4}
          value={formData.description} onChange={handleChange}
          className="textarea-field"
        />

        {/* state dropdown */}
        <div className="flex items-center space-x-4">
          <label className="input-label" htmlFor="state">State:</label>
          <select
            name="state" id="state"
            value={formData.state} onChange={handleChange}
            className="select-field"
            style={{ color: stateColor(formData.state) }}
          >
            {LIFECYCLE_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{ color: stateColor(opt.value) }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* created / modified dates */}
        <div className="grid-two-cols">
          <div>
            <label className="label-icon" htmlFor="created">
              <CalendarIcon className="h-5 w-5 text-gray-500" />Created
            </label>
            <input
              type="date" name="created" id="created"
              value={fmt(formData.created)} onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-icon" htmlFor="modified">
              <CalendarIcon className="h-5 w-5 text-gray-500" />Modified
            </label>
            <input
              type="date" name="modified" id="modified"
              value={fmt(formData.modified)} onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}
