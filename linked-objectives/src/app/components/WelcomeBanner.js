'use client';

import '@/app/styles/WelcomeBanner.css';

function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function WelcomeBanner({ name, id, teamId }) {
  return (
    <div className="welcome-banner bg-white shadow p-4 rounded">
      <div className="flex items-center space-x-4">
        <div className="welcome-avatar">
          {getInitials(name)}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome back, {name}!</h2>
            <div className="text-sm space-x-2">
              <a href={`/people/${id}`} className="welcome-link">View Profile</a>
              <a href={`/teams/${teamId}`} className="welcome-link">My Team</a>
            </div>
        </div>
      </div>
    </div>
  );
}
