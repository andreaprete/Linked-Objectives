'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/componentsUser/Sidebar';
import Header from '@/app/componentsUser/Header';
import UserProfile from '@/app/componentsUser/UserProfile';
import OkrList from '@/app/componentsUser/OkrList';

export default function ObjectivePage() {
  const { id } = useParams(); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOkr() {
      try {
        const res = await fetch(`/api/objectives/${id}`);
        const json = await res.json();
        console.log('Fetched OKR data:', json.data);
        setData(json.data);
      } catch (err) {
        console.error('Failed to load OKR data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOkr();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <p className="text-lg">Loading OKR...</p>
      </div>
    </div>
  );
  
  if (!data || Object.keys(data).length === 0)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <p className="text-red-500">Failed to load OKR.</p>
        </div>
      </div>
    );

  // Mock user data for the demo
  const userData = {
    name: "Firstname Lastname",
    role: "Role of the user",
    description: "Description",
    email: "Email:",
    username: "Username:",
    location: "Location:",
    team: "Team:",
    department: "Department:",
    company: "Company:",
    profileImage: "/profileImage.jpg" // Path to profile image
  };

  // Mock OKRs data
  const okrData = [
    {
      id: "okr1",
      title: "OKR title",
      description: "OKR description",
      category: "category",
      status: "status",
      progress: 50
    },
    {
      id: "okr2",
      title: "OKR title",
      description: "OKR description",
      category: "category",
      status: "status",
      progress: 50
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header username="User Name" />
        <div className="flex-1 p-6 overflow-y-auto">
          <UserProfile user={userData} />
          <OkrList username="Firstname" okrs={okrData} />
        </div>
      </div>
    </div>
  );
}
