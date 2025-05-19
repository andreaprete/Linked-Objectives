'use client';
import Link from 'next/link';
import '@/app/styles/DepartmentCard.css';

export default function DepartmentCard({ department, index }) {
  const getInitials = (name) =>
    name
      .split(' ')
      .map((word) => word[0]?.toUpperCase())
      .slice(0, 2)
      .join('');

  const bgClass = ['bg-blue', 'bg-green', 'bg-orange'][index % 3];

  const departmentLink =
    department.teams?.length === 0
      ? `/teams/${encodeURIComponent(department.name)}`
      : `/departments/${department.id}`;

  return (
    <div className="department-card-wrapper">
      {/* Department top-level link */}
      <Link href={departmentLink} className="department-card-link">
        <div className="department-card">
          <div className={`department-initials ${bgClass}`}>
            {getInitials(department.name)}
          </div>
          <div className={`department-name ${department.teams?.length === 0 ? 'bold' : ''}`}>
            {department.name}
            {department.teams?.length === 0 && ' (No Teams)'}
          </div>
        </div>
      </Link>

      {/* Teams list */}
      {department.teams?.length > 0 && (
        <div className="department-teams">
          {department.teams.map((team) => (
            <div
              key={team.id || team.name}
              className="team-card-dep"
              onClick={() =>
                window.location.href = `/teams/${encodeURIComponent(team.id || department.name)}`
              }
              style={{ cursor: 'pointer' }}
            >
              <div className="team-card-dep-link">
                <div className="team-name">{team.name}</div>

                <div
                  className="team-members"
                  onClick={(e) => e.stopPropagation()}
                >
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="member-badge"
                      title={`Role: ${member.roleTitle || 'Unknown'}\nLocation: ${member.location || 'Unknown'}`}
                    >
                      <Link
                        href={`/people/${member.id}`}
                        className="team-member"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
