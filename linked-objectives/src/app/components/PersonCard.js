import Link from 'next/link';

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function PersonCard({ person }) {
  return (
    <div className="person-card group">
      <div className="person-card-avatar">{getInitials(person.name)}</div>
      <div className="person-card-info">
        <div className="person-card-name font-semibold">
          <Link href={`/people/${person.id}`} className="hover:underline">
            {person.name}
          </Link>
        </div>
        <div className="person-card-role">{person.role}</div>
        <div className="person-card-meta">
          {person.team && person.teamId && (
            <Link
              href={`/teams/${person.teamId}`}
              className="person-card-link"
            >
              {person.team}
            </Link>
          )}
        </div>
        <div className="person-card-objectives">
          <span className="person-card-okr-badge">
            {person.objectiveCount ?? 0} Objectives
          </span>
        </div>
      </div>
    </div>
  );
}
