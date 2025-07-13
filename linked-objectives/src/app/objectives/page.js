'use client';

import { useEffect, useState } from 'react';
import { Target, ArrowDownAZ, BarChart2 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OkrCardsForList from '../components/OkrCardsForList';
import "@/app/styles/ObjectivesListPage.css";
import { useSession } from 'next-auth/react';

const ObjectivesListPage = () => {
  const [objectives, setObjectives] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dimensionFilter, setDimensionFilter] = useState('all');
  const [expandedColumn, setExpandedColumn] = useState(null);
  const [columnSorts, setColumnSorts] = useState({});
  const { data: session } = useSession();
  const [onlyMine, setOnlyMine] = useState(false);

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

  const lifecycleOrder = {
    Idea: 1,
    Planned: 2,
    InProgress: 3,
    Completed: 4,
    Archived: 5,

    Draft: 6,
    Evaluating: 7,
    Approved: 8,
    Deprecated: 9,

    Released: 10,
    Withdrawn: 11,

    Proposed: 12,
    Rejected: 13,

    OnHold: 99,
    Aborted: 100,
    Cancelled: 101
  };

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
        setDetails(Object.fromEntries(list.map((obj) => [obj.id, obj])));
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
    const matchesDimension = dimensionFilter === 'all' || detail.stateDimension === dimensionFilter;
    const matchesUser = !onlyMine || (session?.user?.email && detail.people?.includes(session.user.email));
    return matchesSearch && matchesCategory && matchesDimension && matchesUser;
  });

  const uniqueCategories = [...new Set(Object.values(details).map((d) => d.category).filter(Boolean))];

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
      <div className="flex justify-center px-4">
        <div className="objectives-content-container w-full max-w-7xl">
          <div className="objectives-header-section">
            <div className="objectives-page-header">
              <Target size={24} />
              Objectives – Kanban View
            </div>
            <div className="objectives-search-filter">
              <input
                type="text"
                placeholder="Search title/description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={dimensionFilter}
                onChange={(e) => setDimensionFilter(e.target.value)}
              >
                <option value="all">All Dimensions</option>
                <option value="DevelopmentStateScheme">Development</option>
                <option value="MaturityStateScheme">Maturity</option>
                <option value="DecisionStateScheme">Decision</option>
                <option value="ReleaseStateScheme">Release</option>
              </select>
              <button
                onClick={() => setOnlyMine(!onlyMine)}
                className={`my-objectives-toggle ${onlyMine ? 'active' : ''}`}
              >
                {onlyMine ? 'Showing My Okrs' : 'Only My Okrs'}
              </button>
            </div>
          </div>

          {filteredObjectives.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No OKRs match your criteria.</p>
          ) : (
            <div className="kanban-board">
              {Object.entries(groupedByState)
              .sort(([a], [b]) => (lifecycleOrder[a] ?? 999) - (lifecycleOrder[b] ?? 999))
              .map(([state, okrs]) => {
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
                      <h3
                        className="kanban-column-title"
                        style={{ color: stateColor(state) }}
                      >
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
};

export default ObjectivesListPage;
