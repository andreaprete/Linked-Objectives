import { useState } from "react";
import Link from "next/link";
import "../styles/UserProfile.css";

function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function UserProfile({ user }) {
  const roles = user.roles || [];
  const baseInfo = user;
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const activeRole = roles[activeRoleIndex];
  console.log("UserProfile props:", user);

  return (
    <div className="user-profile-card">
      <div className="user-profile-avatar">
        <div className="avatar-circle avatar-initials">
          {getInitials(baseInfo.name)}
        </div>
      </div>

      <div className="user-profile-info">
        <h1 className="user-name">{baseInfo.name}</h1>

        {activeRole ? (
          <>
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
                <p>Email: {baseInfo.email}</p>
                <p>Username: {baseInfo.username}</p>
                <p>Location: {baseInfo.location}</p>
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
