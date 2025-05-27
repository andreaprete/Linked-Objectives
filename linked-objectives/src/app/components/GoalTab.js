'use client';
import GoalCard from './GoalCard';
import styles from '@/app/styles/GoalTab.module.css';

export default function GoalTab({ okrs = [], onAddGoal }) {
  const uniqueOkrs = Array.from(new Map(okrs.map(okr => [okr.id, okr])).values());

  return (
    <section className={styles['goal-tab-section']}>
      <div className={styles['goal-tab-header']}>
        <div className={styles['goal-tab-title']}>My Goals</div>
        <div className={styles['goal-tab-actions']}>
          <button className={styles['goal-tab-filter']} title="Filter">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 9.5V5.5C6 4.39543 6.89543 3.5 8 3.5H14C15.1046 3.5 16 4.39543 16 5.5V9.5M6 9.5V16.5863C6 17.0381 6.21071 17.4631 6.55279 17.7071L10.2764 20.3654C10.7257 20.6917 11.2743 20.6917 11.7236 20.3654L15.4472 17.7071C15.7893 17.4631 16 17.0381 16 16.5863V9.5M6 9.5H16" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button className={styles['goal-tab-add']} onClick={onAddGoal}>+ Add Goal</button>
        </div>
      </div>
      <div>
        {uniqueOkrs.map((okr) => (
          <GoalCard
            key={okr.id}
            id={okr.id}
            title={okr.title}
            state={okr.state}
            progress={okr.progress}
          />
        ))}
      </div>
    </section>
  );
}
