'use client';

import Link from 'next/link';
import '../styles/UserProfile.css';

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  // Take first letter of first and last word (so “Andrea Prete Rossi” → “AR”)
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function UserProfile({ user }) {
  return (
    <div className="user-profile-card">
      <div className="user-profile-avatar">
        <div className="avatar-circle avatar-initials">
          {getInitials(user.name)}
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
            <p>
              Team:{' '}
              <Link href={`/teams/${user.teamId}`} className="text-blue-600 hover:underline">
                {user.team}
              </Link>
            </p>
            <p>
              Department:{' '}
              <Link href={`/departments/${user.departmentId}`} className="text-blue-600 hover:underline">
                {user.department}
              </Link>
            </p>
            <p>
              Company:{' '}
              <Link href={`/companies/${user.companyId}`} className="text-blue-600 hover:underline">
                {user.company}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
