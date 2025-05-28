import Link from 'next/link';

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function slugify(team) {
  if (!team) return '';
  return team
    .replace(/^Team\s*/i, '')       // remove "Team " at start
    .replace(/[^a-zA-Z0-9]/g, '')  // remove non-alphanumeric
    .replace(/\s+/g, '')           // remove spaces
    .trim();
}

function slugifyTeam(team) {
  if (!team) return '';
  // Remove 'Team' and everything until the first dash (– or -), but keep 'Team' for the slug
  // Match: Team B – Frontend & UX --> Frontend & UX
  //        Team C - DevOps & QA  --> DevOps & QA
  const match = team.match(/Team\s*[^–-]*[–-]\s*(.+)$/); // match after first dash
  const clean = match ? match[1] : team.replace(/^Team\s*/i, '');
  // Now remove non-alphanumeric characters
  return 'Team' + clean.replace(/[^a-zA-Z0-9]/g, '');
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
          {person.team && (
            <Link
              href={`/teams/${slugifyTeam(person.team)}`}
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