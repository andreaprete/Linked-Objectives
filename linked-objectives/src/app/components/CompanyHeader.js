import Link from 'next/link';
import '@/app/styles/CompanyHeader.css';
import { FaUsers, FaSitemap, FaBullseye } from 'react-icons/fa';

export default function CompanyHeader({
  name,
  homepage,
  stats,
  onDepartmentsClick,
}) {
  return (
    <div className="company-meta-block graphical-header-refined">
      <h2 className="company-name">{name}</h2>

      <div className="company-meta-inline">
        <span className="label">Website:</span>{' '}
        {homepage ? (
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="company-homepage-link"
          >
            {homepage}
          </a>
        ) : (
          '—'
        )}
      </div>

      <div className="company-meta-cards">
        {/* Scrolls to departments on page */}
        <div
          className="meta-item-refined clickable-meta"
          onClick={onDepartmentsClick}
        >
          <FaSitemap className="meta-icon-refined" />
          <dt>Departments</dt>
          <dd>{stats?.departmentCount ?? '—'}</dd>
        </div>

        {/* Navigates to /employees */}
        <Link href="/employees" className="meta-item-refined clickable-meta">
          <FaUsers className="meta-icon-refined" />
          <dt>Employees</dt>
          <dd>{stats?.employeeCount ?? '—'}</dd>
        </Link>

        {/* Navigates to /objectives */}
        <Link href="/objectives" className="meta-item-refined clickable-meta">
          <FaBullseye className="meta-icon-refined" />
          <dt>OKRs</dt>
          <dd>{stats?.objectiveCount ?? '—'}</dd>
        </Link>
      </div>

      <div className="company-meta-inline">
        <span className="label">Last Update:</span>{' '}
        {stats?.lastUpdated
          ? new Date(stats.lastUpdated).toLocaleDateString()
          : 'N/A'}
      </div>
    </div>
  );
}
