'use client';

import { useState } from 'react';
import Link from 'next/link';
import OkrCard from './OkrCard';

export default function OkrList({ username, okrs }) {
  const [caresForOpen, setCaresForOpen] = useState(true);
  const [operatesOpen, setOperatesOpen] = useState(false);
  const [accountableForOpen, setAccountableForOpen] = useState(false);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{username}'s OKRs:</h2>
      
      <div className="space-y-6">
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
              {okrs.map(okr => (
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
}