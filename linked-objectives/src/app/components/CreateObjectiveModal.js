"use client";

import { useState, useEffect } from "react";

export default function CreateObjectiveModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    const mainInner = document.querySelector(".main-inner");
    if (mainInner) mainInner.scrollTop = 0;

    const html = document.documentElement;
    const body = document.body;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (mainInner) mainInner.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = "";
      html.style.overflow = "";
      if (mainInner) mainInner.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await onCreate(formData);
    setFormData({ title: "", comment: "", description: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
      style={{
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">Create New Objective</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              name="comment"
              id="comment"
              rows={2}
              placeholder="Comment"
              value={formData.comment}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
