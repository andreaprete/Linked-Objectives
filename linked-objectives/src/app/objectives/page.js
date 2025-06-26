'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OkrCardsForList from '../components/OkrCardsForList';
import "@/app/styles/ObjectivesListPage.css";
import { SortAsc, SortDesc, ArrowDownAZ, BarChart2 } from 'lucide-react';

const stateColor = (s) => {
  switch (s) {
    case "Draft":
    case "Idea":
    case "Planned": return "#3b82f6";  // blue
    case "Evaluating":
    case "Approved":
    case "Released": return "#8b5cf6";  // purple
    case "InProgress":
    case "Completed":
    case "Archived": return "#10b981";  // green
    case "Aborted":
    case "Withdrawn":
    case "Rejected":
    case "Cancelled": return "#ef4444";  // red
    case "OnHold":
    case "Deprecated": return "#f59e0b";  // orange
    default: return "#6b7280";  // gray
  }
};

export default function ObjectivesListPage() {
  const [objectives, setObjectives] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedColumn, setExpandedColumn] = useState(null);
  const [columnSorts, setColumnSorts] = useState({});

  const toggleColumn = (stateName) => {
    setExpandedColumn((prev) => (prev === stateName ? null : stateName));
  };

  const toggleSort = (state, field) => {
    setColumnSorts((prev) => {
      const current = prev[state]?.field === field ? prev[state].direction : null;
      const nextDirection = current === "asc" ? "desc" : "asc";
      return {
        ...prev,
        [state]: { field, direction: nextDirection }
      };
    });
  };

  const sortOkrs = (okrs, sort) => {
    if (!sort) return okrs;
    return [...okrs].sort((a, b) => {
      const valA = sort.field === "name"
        ? a.detail.title?.toLowerCase() || ""
        : a.detail.progress || 0;
      const valB = sort.field === "name"
        ? b.detail.title?.toLowerCase() || ""
        : b.detail.progress || 0;

      return sort.direction === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  };

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch('/api/objectiveslist', { cache: 'no-store' });
        const list = await res.json();
        setObjectives(list);

        const detailsMap = {};
        await Promise.all(
          list.map(async (obj) => {
            try {
              const res = await fetch(`/api/objectives/${obj.id}`, { cache: 'no-store' });
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
      (detail.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (detail.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || detail.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [
    ...new Set(Object.values(details).map((d) => d.category).filter(Boolean)),
  ];

  const groupedByState = {};
  filteredObjectives.forEach((okr) => {
    const detail = details[okr.id] || {};
    const state = detail.state || "Unspecified";
    if (!groupedByState[state]) groupedByState[state] = [];
    groupedByState[state].push({ ...okr, detail });
  });

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
        <div className="objectives-content-container w-full max-w-7xl bg-white rounded-xl shadow p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <Target className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-blue-600">Objectives – Kanban View</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md w-full sm:w-72 bg-gray-50 text-sm"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md w-full sm:w-48 bg-gray-50 text-sm"
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
            <div className="kanban-board">
              {Object.entries(groupedByState).map(([state, okrs]) => {
                const isExpanded = expandedColumn === state;
                const sort = columnSorts[state];
                const sortedOkrs = sortOkrs(okrs, sort);

                return (
                  <div
                    key={state}
                    className={`kanban-column ${isExpanded ? "expanded" : "collapsed"}`}
                    onClick={() => toggleColumn(state)}
                  >
                    <div className="kanban-column-header">
                      <h3 className="kanban-column-title" style={{ color: stateColor(state) }}>
                        {state}
                      </h3>
                      <div className="kanban-column-sort-controls">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSort(state, "name");
                          }}
                          title="Sort by Name"
                        >
                          <ArrowDownAZ size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSort(state, "progress");
                          }}
                          title="Sort by Progress"
                        >
                          <BarChart2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="kanban-column-cards">
                      {sortedOkrs.map((okr) => (
                        <OkrCardsForList
                          key={okr.id}
                          id={okr.id}
                          title={okr.detail.title || okr.title}
                          description={okr.detail.description}
                          averageProgress={okr.detail.progress || 0}
                          state={okr.detail.state}
                          category={okr.detail.category}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
