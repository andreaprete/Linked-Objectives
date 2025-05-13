'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="bg-gray-700 text-white w-48 flex-shrink-0">
      <div className="p-4 text-xl font-bold border-b border-gray-600">
        <h1>OKR Tool</h1>
      </div>
      
      <nav className="flex flex-col">
        <div className="mt-6 px-4">
          <Link href="/" className="block text-white py-2 hover:bg-gray-600">
            Home
          </Link>
          <Link href="/dashboard" className="block text-white py-2 bg-gray-500 hover:bg-gray-600">
            Dashboard
          </Link>
        </div>
        
        <div className="mt-2 px-4 text-sm text-gray-300">
            Goals
        </div>
        
        <div className="px-4 font-medium">
          <Link href="/teams" className="block text-white py-2 hover:bg-gray-600">
            Teams
          </Link>
          <Link href="/users" className="block text-white py-2 hover:bg-gray-600">
            Users
          </Link>
        </div>
        
        <div className="mt-2 px-4 text-sm text-gray-300">
            Strategy
        </div>
        
        <div className="px-4 font-medium">
          <Link href="/strategy-map" className="block text-white py-2 hover:bg-gray-600">
            Strategy Map
          </Link>
        </div>
      </nav>
    </div>
  );
}