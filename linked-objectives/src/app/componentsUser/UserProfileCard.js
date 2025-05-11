export default function UserProfileCard() {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-6">
        <img
          src="https://via.placeholder.com/100"
          alt="User"
          className="rounded-full w-24 h-24"
        />
        <div>
          <h2 className="text-xl font-semibold">Firstname Lastname</h2>
          <p className="text-gray-500 italic">Role of the user</p>
          <p className="mt-2 text-sm text-gray-600">Description of the role description of the role...</p>
          <div className="text-sm mt-2 space-y-1">
            <p>Email:</p>
            <p>Username:</p>
            <p>Location:</p>
            <p>Team:</p>
            <p>Department:</p>
            <p>Company:</p>
          </div>
        </div>
      </div>
    );
  }
  