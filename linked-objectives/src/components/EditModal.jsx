'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/20/solid'; // Make sure @heroicons is installed

export default function EditModal({ initialData, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="relative z-10 bg-white rounded-xl shadow-xl p-8 w-full max-w-3xl space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Edit Key Result</h2>

        {/* Row 1: Title + Progress */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progress: {formData.progress}%</label>
            <input
              type="range"
              name="progress"
              id="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="mt-2 w-full"
            />
          </div>
        </div>

        {/* Row 2: Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
          <textarea
            name="comment"
            id="comment"
            value={formData.comment}
            onChange={handleChange}
            className="mt-1 block w-full border p-2 rounded"
            rows={2}
            placeholder="Comment"
          />
        </div>

        {/* Row 3: Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border p-2 rounded"
            rows={4}
            placeholder="Description"
          />
        </div>

        {/* Row 4: State */}
        <div className="flex items-center space-x-4">
          <label htmlFor="state" className="text-sm font-medium text-gray-700">State:</label>
          <select
            name="state"
            id="state"
            value={formData.state}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        {/* Row 5: Created + Modified */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="created" className="flex items-center text-sm font-medium text-gray-700 gap-1">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Created
            </label>
            <input
              type="date"
              name="created"
              id="created"
              value={formData.created}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
          <div>
            <label htmlFor="modified" className="flex items-center text-sm font-medium text-gray-700 gap-1">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Modified
            </label>
            <input
              type="date"
              name="modified"
              id="modified"
              value={formData.modified}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
