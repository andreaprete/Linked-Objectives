import Link from "next/link";

function getInitials(name) {
  if (!name) return "?";
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

        {/* Roles comma-separated */}
        <div className="person-card-role text-sm text-gray-700">
          {person.roles?.join(", ")}
        </div>

        {/* All team links */}
        <div className="person-card-meta flex flex-wrap gap-1">
          {person.teams?.map((team, index) => (
            <Link
              key={index}
              href={`/teams/${team.id}`}
              className="person-card-link"
            >
              {team.name}
            </Link>
          ))}
        </div>

        <div className="person-card-objectives mt-1">
          <span className="person-card-okr-badge">
            {person.objectiveCount} Objectives
          </span>
        </div>
      </div>
    </div>
  );
}
