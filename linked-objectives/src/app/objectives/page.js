'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OkrCardsForList from '../components/OkrCardsForList';
import "@/app/styles/ObjectivesListPage.css";

export default function ObjectivesListPage() {
  const [objectives, setObjectives] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch('/api/objectiveslist', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        const list = await res.json();
        setObjectives(list);

        const detailsMap = {};
        await Promise.all(
          list.map(async (obj) => {
            try {
              const res = await fetch(`/api/objectives/${obj.id}`, {
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                  Pragma: 'no-cache',
                },
              });
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

  return (
    <AppLayout>
      <div className="flex justify-center px-4 py-8">
        <div className="objectives-content-container w-full max-w-6xl bg-white rounded-xl shadow p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <Target className="text-blue-600" size={28} />
              <h2 className="text-2xl font-semibold text-blue-600">Objectives – OKRs</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-72 bg-gray-50 text-sm"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-48 bg-gray-50 text-sm"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredObjectives.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No OKRs match your criteria.</p>
          ) : (
            <div className="space-y-4">
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
      </div>
    </AppLayout>
  );
}
