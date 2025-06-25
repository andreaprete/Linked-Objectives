import { useState } from "react";
import Link from "next/link";
import "../styles/UserProfile.css";

function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function UserProfile({ user }) {
  const roles = user.roles ?? [];
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const activeRole = roles[activeRoleIndex];

  return (
    <div className="user-profile-card">
      {/* Avatar */}
      <div className="user-profile-avatar">
        <div className="avatar-circle avatar-initials">
          {getInitials(user.name)}
        </div>
      </div>

      {/* Info */}
      <div className="user-profile-info">
        <h1 className="user-name">{user.name}</h1>

        {/* 👉 always show the role title if a role exists */}
        {activeRole && <p className="user-role">{activeRole.roleTitle}</p>}

        {activeRole ? (
          <>
            {/* Dropdown only when there’s more than one role */}
            {roles.length > 1 && (
              <div className="mt-2 mb-4">
                <label
                  htmlFor="role-select"
                  className="text-sm text-gray-600 mr-2"
                >
                  Switch Role:
                </label>
                <select
                  id="role-select"
                  value={activeRoleIndex}
                  onChange={(e) => setActiveRoleIndex(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
                >
                  {roles.map((r, i) => (
                    <option key={i} value={i}>
                      {r.roleTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="user-description">{activeRole.roleDescription}</p>

            <div className="user-profile-details">
              <div className="details-column">
                <p>Email: {user.email}</p>
                <p>Username: {user.username}</p>
                <p>Location: {user.location ?? "—"}</p>
              </div>
              <div className="details-column">
                <p>
                  Team:{" "}
                  <Link
                    href={`/teams/${activeRole.team}`}
                    className="text-blue-600 hover:underline"
                  >
                    {activeRole.teamName}
                  </Link>
                </p>
                <p>
                  Department:{" "}
                  <Link
                    href={`/departments/${activeRole.department}`}
                    className="text-blue-600 hover:underline"
                  >
                    {activeRole.departmentName}
                  </Link>
                </p>
                <p>
                  Company:{" "}
                  <Link
                    href={`/companies/${activeRole.company}`}
                    className="text-blue-600 hover:underline"
                  >
                    {activeRole.company}
                  </Link>
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-500">No role information available.</p>
        )}
      </div>
    </div>
  );
}
