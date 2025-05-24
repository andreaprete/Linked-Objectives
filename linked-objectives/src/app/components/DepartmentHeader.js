'use client';

import Link from 'next/link';
import '@/app/styles/DepartmentHeader.css';
import { FaSitemap, FaUsers, FaBullseye, FaGlobe } from 'react-icons/fa';

export default function DepartmentHeader({ name, company, homepage, stats, onStatClick }) {
  return (
    <div className="dept-header">
      <h2 className="dept-title">{name}</h2>

      {company && (
        <div className="dept-inline">
          <span className="dept-label">Company:</span>
          <Link href={`/companies/${company}`} className="dept-link">
            {company}
          </Link>
        </div>
      )}

      {homepage && (
        <div className="dept-inline">
          <span className="dept-label">Homepage:</span>
          <a href={homepage} target="_blank" rel="noopener noreferrer" className="dept-link">
            {homepage}
          </a>
        </div>
      )}

      <div className="dept-cards ">
        <div className="dept-card" onClick={() => onStatClick?.('teams')} style={{ cursor: 'pointer' }}>
          <FaSitemap className="dept-icon" />
          <dt>Teams</dt>
          <dd>{stats?.teamCount ?? '—'}</dd>
        </div>
        <div className="dept-card" onClick={() => onStatClick?.('employees')} style={{ cursor: 'pointer' }}>
          <FaUsers className="dept-icon" />
          <dt>Employees</dt>
          <dd>{stats?.employeeCount ?? '—'}</dd>
        </div>
        <div className="dept-card" onClick={() => onStatClick?.('okrs')} style={{ cursor: 'pointer' }}>
          <FaBullseye className="dept-icon" />
          <dt>OKRs</dt>
          <dd>{stats?.okrCount ?? '—'}</dd>
        </div>
      </div>
    </div>
  );
}
