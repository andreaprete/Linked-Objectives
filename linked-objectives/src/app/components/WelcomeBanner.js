'use client';

export function WelcomeBanner({ name, id, teamId }) {
  return (
    <div className="bg-white shadow p-4 rounded">
      <div className="flex items-center space-x-4">
        <img src="/avatar.png" className="w-12 h-12 rounded-full" />
        <div>
          <h2 className="text-lg font-semibold">Welcome back, {name}!</h2>
          <div className="text-sm text-blue-600 space-x-2">
            <a href={`/people/${id}`}>View Profile</a>
            <a href={`/teams/${teamId}`}>My Team</a>
          </div>
        </div>
      </div>
    </div>
  );
}
