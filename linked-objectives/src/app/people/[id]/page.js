'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import AppLayout from '@/app/components/AppLayout'; // Unified layout!
import UserProfile from '@/app/components/UserProfile';
import OkrList from '@/app/components/OkrList';

export default function PersonPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchPerson() {
      try {
        const res = await fetch(`http://localhost:3000/api/people/${id}`);
        const json = await res.json();
        setData(json.data);
        setOkrs(json.okrs || []);
      } catch (err) {
        console.error('Failed to load person data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPerson();
  }, [id]);

    if (loading) return (
      <AppLayout>
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading People data...</p>
          </div>
        </main>
      </AppLayout>
    );
  if (!data) return (
    <AppLayout>
      <div className="p-6 text-red-500">Person not found.</div>
    </AppLayout>
  );

  // Prepare userData for UserProfile
  const userData = {
    name: data.name,
    role: data.roleTitle,
    description: "Description",
    email: data.email,
    username: data.username,
    location: data.location,
    team: data.team,
    department: data.department,
    company: data.company,
    profileImage: "/profileImage.jpg" // Path to profile image
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <UserProfile user={userData} />
        <OkrList username={data.name} okrs={okrs} />
      </div>
    </AppLayout>
  );
}
