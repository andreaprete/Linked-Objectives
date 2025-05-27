'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/app/components/AppLayout';
import PeopleHeader from '@/app/components/PeopleHeader';
import PersonCard from '@/app/components/PersonCard';
import '@/app/styles/Peoplelist.css';

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPeople() {
      const res = await fetch('/api/peoplelist');
      const data = await res.json();
      setPeople(data);
      setLoading(false);
    }
    fetchPeople();
  }, []);

  const filtered = people.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="people-list-bg min-h-screen py-8 flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 space-y-6">
          <PeopleHeader count={people.length} search={search} setSearch={setSearch} />
          {loading ? (
            <div className="people-list-loading">Loading people...</div>
          ) : filtered.length === 0 ? (
            <div className="people-list-empty">No people found.</div>
          ) : (
            <>
              <div className="people-list-grid">
                {filtered.slice(0, visibleCount).map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="people-list-more" onClick={() => setVisibleCount(v => v + 12)}>
                  Show More...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
