'use client';

import { useState } from 'react';
import GoalCard from './GoalCard';
import styles from '@/app/styles/GoalTab.module.css';

export default function GoalTab({ okrs = [], onAddGoal, userRole }) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterProgressMin, setFilterProgressMin] = useState('');
  const [filterProgressMax, setFilterProgressMax] = useState('');
  const [filterStartDateMin, setFilterStartDateMin] = useState('');
  const [filterStartDateMax, setFilterStartDateMax] = useState('');
  const [filterEndDateMin, setFilterEndDateMin] = useState('');
  const [filterEndDateMax, setFilterEndDateMax] = useState('');

  const isAdmin = userRole === 'admin';
  const toggleFilters = () => setFilterVisible((prev) => !prev);

  const handleClearFilters = () => {
    setFilterTitle('');
    setFilterState('all');
    setFilterProgressMin('');
    setFilterProgressMax('');
    setFilterStartDateMin('');
    setFilterStartDateMax('');
    setFilterEndDateMin('');
    setFilterEndDateMax('');
  };

  const availableStates = Array.from(new Set(okrs.map((okr) => okr.state))).filter(Boolean);

  const uniqueOkrs = Array.from(new Map(okrs.map((okr) => [okr.id, okr])).values());

  const filteredOkrs = uniqueOkrs.filter((okr) => {
    const matchesTitle = okr.title.toLowerCase().includes(filterTitle.toLowerCase());

    const matchesState = filterState === 'all' || okr.state === filterState;

    const matchesProgressMin =
      filterProgressMin === '' || okr.progress >= parseFloat(filterProgressMin);

    const matchesProgressMax =
      filterProgressMax === '' || okr.progress <= parseFloat(filterProgressMax);

    const startDate = okr.interval?.hasBeginning ? new Date(okr.interval.hasBeginning) : null;
    const endDate = okr.interval?.hasEnd ? new Date(okr.interval.hasEnd) : null;

    const matchesStartDateMin =
      !filterStartDateMin || (startDate && new Date(filterStartDateMin) <= startDate);
    const matchesStartDateMax =
      !filterStartDateMax || (startDate && new Date(filterStartDateMax) >= startDate);

    const matchesEndDateMin =
      !filterEndDateMin || (endDate && new Date(filterEndDateMin) <= endDate);
    const matchesEndDateMax =
      !filterEndDateMax || (endDate && new Date(filterEndDateMax) >= endDate);

    return (
      matchesTitle &&
      matchesState &&
      matchesProgressMin &&
      matchesProgressMax &&
      matchesStartDateMin &&
      matchesStartDateMax &&
      matchesEndDateMin &&
      matchesEndDateMax
    );
  });

  return (
    <section className={styles['goal-tab-section']}>
      <div className={styles['goal-tab-header']}>
        <div className={styles['goal-tab-title']}>My Goals</div>
        <div className={styles['goal-tab-actions']}>
          <button className={styles['goal-tab-filter']} title="Show Filters" onClick={toggleFilters}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M6 9.5V5.5C6 4.39543 6.89543 3.5 8 3.5H14C15.1046 3.5 16 4.39543 16 5.5V9.5M6 9.5V16.5863C6 17.0381 6.21071 17.4631 6.55279 17.7071L10.2764 20.3654C10.7257 20.6917 11.2743 20.6917 11.7236 20.3654L15.4472 17.7071C15.7893 17.4631 16 17.0381 16 16.5863V9.5M6 9.5H16"
                stroke="#222"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {isAdmin && (
            <button className={styles['goal-tab-add']} onClick={onAddGoal}>
              + Add Goal
            </button>
          )}
        </div>
      </div>

      {filterVisible && (
        <div
          className={`${styles['goal-tab-filters-wrapper']} ${
            filterVisible ? styles['fade-in'] : styles['fade-out']
          }`}
        >
          <div className={styles['goal-tab-filters-label']}>Filter your goals:</div>
          <div className={styles['goal-tab-filters']}>
            <div className={styles['filter-group']}>
              <label>Title</label>
              <input
                type="text"
                placeholder="Search Title"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>State</label>
              <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                <option value="all">All States</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles['filter-group']}>
              <label>Min Progress (%)</label>
              <input
                type="number"
                placeholder="Min %"
                value={filterProgressMin}
                onChange={(e) => setFilterProgressMin(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>Max Progress (%)</label>
              <input
                type="number"
                placeholder="Max %"
                value={filterProgressMax}
                onChange={(e) => setFilterProgressMax(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>Start Date (from)</label>
              <input
                type="date"
                value={filterStartDateMin}
                onChange={(e) => setFilterStartDateMin(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>Start Date (to)</label>
              <input
                type="date"
                value={filterStartDateMax}
                onChange={(e) => setFilterStartDateMax(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>End Date (from)</label>
              <input
                type="date"
                value={filterEndDateMin}
                onChange={(e) => setFilterEndDateMin(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label>End Date (to)</label>
              <input
                type="date"
                value={filterEndDateMax}
                onChange={(e) => setFilterEndDateMax(e.target.value)}
              />
            </div>
          </div>

          <div className={styles['filter-clear-container']}>
            <button className={styles['clear-filters-button']} onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div>
        {filteredOkrs.length > 0 ? (
          filteredOkrs.map((okr) => (
            <GoalCard
              key={okr.id}
              id={okr.id}
              title={okr.title}
              state={okr.state}
              progress={okr.progress}
            />
          ))
        ) : (
          <p className={styles['goal-tab-empty']}>No goals match these filters.</p>
        )}
      </div>
    </section>
  );
}
