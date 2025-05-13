'use client';

import { useState } from 'react';
import Sidebar from '@/app/componentsUser/Sidebar';
import OkrCard from '@/app/componentsUser/OkrCard';
import OkrList from '@/app/componentsUser/OkrList';
import Image from 'next/image';

export default function Page() {
  const [activeTab, setActiveTab] = useState('OKRs');
  const [caresForOpen, setCaresForOpen] = useState(true);
  const [operatesOpen, setOperatesOpen] = useState(false);
  const [accountableForOpen, setAccountableForOpen] = useState(false);
  
  // Mock data for OKRs
  const mockOkrs = [
    {
      id: 1,
      title: 'OKR title',
      description: 'OKR description',
      category: 'Business',
      status: 'On Track',
      progress: 50
    },
    {
      id: 2,
      title: 'OKR title',
      description: 'OKR description',
      category: 'Development',
      status: 'On Track',
      progress: 50
    }
  ];
  
  // Mock data for team members
  const mockMembers = [
    { id: 1, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' },
    { id: 2, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' },
    { id: 3, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' },
    { id: 4, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' },
    { id: 5, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' },
    { id: 6, name: 'Firstname Lastname', role: 'Role of the user', avatarSrc: '/placeholder-avatar.jpg' }
  ];

  const renderOkrsContent = () => {
    return (
      <div className="mt-4">
        <div className="space-y-4">
          <div>
            <button 
              className="flex items-center mb-2 w-full text-left"
              onClick={() => setCaresForOpen(!caresForOpen)}
            >
              <div className="text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 transform transition-transform ${caresForOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="ml-2 text-lg text-gray-600">Cares for</div>
            </button>

            {caresForOpen && (
              <div className="space-y-4">
                {mockOkrs.map(okr => (
                  <OkrCard key={okr.id} okr={okr} />
                ))}
              </div>
            )}
          </div>
          
          <div>
            <button 
              className="flex items-center mb-2 w-full text-left"
              onClick={() => setOperatesOpen(!operatesOpen)}
            >
              <div className="text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 transform transition-transform ${operatesOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="ml-2 text-lg text-gray-600">Operates</div>
            </button>
            
            {operatesOpen && (
              <div className="py-4 text-center text-gray-500 italic">
                No OKRs available
              </div>
            )}
          </div>
          
          <div>
            <button 
              className="flex items-center mb-2 w-full text-left"
              onClick={() => setAccountableForOpen(!accountableForOpen)}
            >
              <div className="text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 transform transition-transform ${accountableForOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="ml-2 text-lg text-gray-600">Accountable for</div>
            </button>
            
            {accountableForOpen && (
              <div className="py-4 text-center text-gray-500 italic">
                No OKRs available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMembersContent = () => {
    return (
      <div className="mt-4 grid grid-cols-2 gap-4">
        {mockMembers.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 text-gray-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-medium">Team Name</h1>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-2 py-1 border rounded-md text-sm"
                />
                <svg
                  className="w-4 h-4 absolute left-2.5 top-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              
              <button className="text-gray-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  ></path>
                </svg>
              </button>
              
              <button className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          {/* Team info card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold">Team Name</h2>
            <div className="text-sm text-gray-500 mt-1">
              <p>Department:</p>
              <p>Company:</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('OKRs')}
                className={`py-2 px-4 text-center ${
                  activeTab === 'OKRs'
                    ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                OKRs
              </button>
              <button
                onClick={() => setActiveTab('Members')}
                className={`py-2 px-4 text-center ${
                  activeTab === 'Members'
                    ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="mt-4">
            {activeTab === 'OKRs' ? renderOkrsContent() : renderMembersContent()}
          </div>
        </main>
      </div>
    </div>
  );
}