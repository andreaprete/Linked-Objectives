'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import AppLayout from '@/app/components/AppLayout';
import TeamOkrsTab from '@/app/components/TeamOkrsTab';

export default function TeamPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/${id}`, {
          cache: 'no-store',
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [id]);

  if (loading) return (
    <AppLayout>
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-md text-gray-600">Loading Team data...</p>
        </div>
      </main>
    </AppLayout>
  );

  if (!data)
    return (
      <AppLayout>
        <p className="p-6 text-red-500">Failed to load team.</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="flex justify-center bg-gray-100 min-h-screen pt-6 pb-16">
        <div className="bg-white rounded-xl shadow p-6 space-y-6 max-w-5xl w-full">
          <div>
            <h1 className="text-2xl font-bold mb-2">{data.team}</h1>
            <p className="text-gray-500 mb-6">
              Department:{' '}
              <Link
                href={`/departments/${data.department}`}
                className="text-blue-600 hover:underline"
              >
                {data.department}
              </Link>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Members</h2>
            <div className="space-y-2">
              {data.members.map((person) => (
                <p key={person.id}>
                  <Link
                    href={`/people/${person.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {person.name}
                  </Link>{' '}
                  – {person.roleTitle} ({person.username}, {person.location})
                </p>
              ))}
            </div>
          </div>

          {data.okrs?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Related OKRs</h2>
              <TeamOkrsTab okrs={data.okrs} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
