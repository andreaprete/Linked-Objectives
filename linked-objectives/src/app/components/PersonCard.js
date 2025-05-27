import Link from 'next/link';

function slugify(name) {
  return name
    ? name.replace(/[^a-zA-Z0-9]/g, '').trim()
    : '';
}

export default function PersonCard({ person }) {
  return (
    <div className="person-card group">
      <div className="person-card-avatar">{person.name?.[0] || '?'}</div>
      <div className="person-card-info">
        <div className="person-card-name font-semibold">
          <Link href={`/people/${person.id}`} className="hover:underline">
            {person.name}
          </Link>
        </div>
        <div className="person-card-role">{person.role}</div>
        <div className="person-card-meta">
          {person.team && (
            <Link
              href={`/teams/${slugify(person.team)}`}
              className="person-card-link"
            >
              {person.team}
            </Link>
          )}
          {person.company && (
            <Link
              href={`/companies/${slugify(person.company)}`}
              className="person-card-link"
            >
              {person.company}
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
