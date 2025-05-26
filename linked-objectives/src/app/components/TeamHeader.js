'use client';

export default function TeamHeader({ team, department, departmentName, company }) {
  return (
    <div className="team-header">
      <h2 className="text-2xl font-semibold">{team}</h2>
      <div className="text-sm text-gray-500 mt-1">
        <p>
          <span className="font-semibold">Department:</span> {departmentName || department || '-'}
        </p>
        <p>
          <span className="font-semibold">Company:</span> {company || '-'}
        </p>
      </div>
    </div>
  );
}
