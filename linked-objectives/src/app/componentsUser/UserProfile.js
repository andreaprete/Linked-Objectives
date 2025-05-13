'use client';

export default function UserProfile({ user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex">
        <div className="mr-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-gray-600 italic mb-2">{user.role}</p>
          <p className="text-sm text-gray-700 mb-4">{user.description}</p>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
            <div>
              <p><span className="font-medium">{user.email}</span></p>
              <p><span className="font-medium">{user.username}</span></p>
              <p><span className="font-medium">{user.location}</span></p>
            </div>
            <div>
              <p><span className="font-medium">{user.team}</span></p>
              <p><span className="font-medium">{user.department}</span></p>
              <p><span className="font-medium">{user.company}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}