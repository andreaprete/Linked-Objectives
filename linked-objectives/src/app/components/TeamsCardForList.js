import Link from "next/link";
import "../styles/TeamsCardForList.css";

export default function TeamsCardForList({ team }) {
  return (
    <div className="team-card">
      <h3 className="team-card-title">
        <Link href={`/teams/${team.id}`} className="hover:underline">
          {team.name}
        </Link>
      </h3>

      <div className="team-card-meta">
        <p>
          <strong>Department:</strong>{" "}
          {team.departmentId ? (
            <Link
              href={`/departments/${team.departmentId}`}
              className="hover:underline"
            >
              {team.department}
            </Link>
          ) : (
            "N/A"
          )}
        </p>
        <p>
          <strong>Company:</strong>{" "}
          {team.companyId ? (
            <Link
              href={`/companies/${team.companyId}`}
              className="hover:underline"
            >
              {team.company}
            </Link>
          ) : (
            "N/A"
          )}
        </p>

        <p>
          <strong>Members:</strong> {team.memberCount} • <strong>OKRs:</strong>{" "}
          {team.okrCount}
        </p>
      </div>

      {team.okrCount > 0 && (
        <div className="team-card-okrs">
          <div className="team-card-okrs-title">Top OKRs:</div>
          <ul>
            {team.okrSample.slice(0, 3).map((okr, idx) => (
              <li key={idx}>{okr}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
