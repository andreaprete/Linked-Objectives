import '@/app/styles/TopNavbar.css'; // Import the CSS file

import Link from 'next/link';

export default function TopNavbar({ title, id }) {
  return (
    <div className="top-navbar">
      <h2 className="text-lg font-semibold text-gray-800">
        {title && id ? (
          <Link href={`/objectives/${id}`} passHref>
            <span className="cursor-pointer">{title} - {id}</span>
          </Link>
        ) : (
          'Objectives'
        )}
      </h2>

      <div className="flex items-center gap-4">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 border rounded text-sm focus:outline-none"
          />
        </div>
        <button className="user-button">
          N
        </button>
      </div>
    </div>
  );
}
