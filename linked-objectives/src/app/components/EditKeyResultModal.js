'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/20/solid';
import '@/app/styles/EditModal.css';

export default function EditModal({ initialData, onClose, onSave, isOpen, lifecycleStates }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Edit Key Result</h2>

        <div className="grid-two-cols">
          <div>
            <label htmlFor="title" className="input-label">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="progress" className="input-label">Progress: {formData.progress}%</label>
            <input
              type="range"
              name="progress"
              id="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="input-field"
            />
          </div>
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

        <div className="flex items-center space-x-4">
          <label htmlFor="state" className="input-label">State:</label>
          <select
            name="state"
            id="state"
            value={formData.state}
            onChange={handleChange}
            className="select-field"
          >
            {/* Dynamically rendering lifecycle states */}
            {lifecycleStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid-two-cols">
          <div>
            <label htmlFor="created" className="label-icon">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Created
            </label>
            <input
              type="date"
              name="created"
              id="created"
              value={formatDate(formData.created)}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="modified" className="label-icon">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Modified
            </label>
            <input
              type="date"
              name="modified"
              id="modified"
              value={formatDate(formData.modified)}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}
