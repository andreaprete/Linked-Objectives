'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import OkrCardsForList from '../components/OkrCardsForList';

export default function ObjectivesListPage() {
  const [objectives, setObjectives] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch('/api/objectiveslist');
        const list = await res.json();
        setObjectives(list);

        const detailsMap = {};
        await Promise.all(
          list.map(async (obj) => {
            try {
              const res = await fetch(`/api/objectives/${obj.id}`);
              const json = await res.json();
              detailsMap[obj.id] = json.data;
            } catch (e) {
              console.error(`Failed to fetch details for ${obj.id}:`, e);
            }
          })
        );

        setDetails(detailsMap);
      } catch (err) {
        console.error('Failed to load objectives list:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchObjectives();
  }, []);

  const filteredObjectives = objectives.filter((okr) => {
    const detail = details[okr.id] || {};
    const matchesSearch =
      (detail.title || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (detail.description || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || detail.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [
    ...new Set(
      Object.values(details)
        .map((d) => d.category)
        .filter(Boolean)
    ),
  ];

  // Loading UI (should be BEFORE the main return!)
  if (loading) {
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

  // Main return
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-1/2"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-1/4"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {filteredObjectives.length === 0 ? (
          <p className="text-gray-500">No OKRs match your criteria.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredObjectives.map((okr) => {
              const detail = details[okr.id] || {};
              return (
                <OkrCardsForList
                  key={okr.id}
                  id={okr.id}
                  title={detail.title || okr.title}
                  description={detail.description}
                  averageProgress={detail.progress || 0}
                  state={detail.state}
                  category={detail.category}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
