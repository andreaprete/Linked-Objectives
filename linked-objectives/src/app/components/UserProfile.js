'use client';

import '../styles/UserProfile.css';

export default function UserProfile({ user }) {
  return (
    <div className="user-profile-card">
      <div className="user-profile-avatar">
        <div className="avatar-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="avatar-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="user-profile-info">
        <h1 className="user-name">{user.name}</h1>
        <p className="user-role">{user.role}</p>
        <p className="user-description">{user.description}</p>

        <div className="user-profile-details">
          <div className="details-column">
            <p>Email: {user.email}</p>
            <p>Username: {user.username}</p>
            <p>Location: {user.location}</p>
          </div>
          <div className="details-column">
            <p>Team: {user.team}</p>
            <p>Department: {user.department}</p>
            <p>Company: {user.company}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
