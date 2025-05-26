'use client';

export default function TeamMembersTab({ members }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      {members.length === 0 ? (
        <div className="collapse-empty">No team members.</div>
      ) : (
        members.map(member => (
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
              <p className="text-sm text-gray-500">{member.roleTitle}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
