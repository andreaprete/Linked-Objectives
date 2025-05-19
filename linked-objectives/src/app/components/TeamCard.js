'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/app/styles/TeamCard.css';

export default function TeamCard({ teamId, team }) {
  const slugify = (str) =>
    str.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');

  return (
    <div className="team-card group">
      <Link href={`/teams/${teamId || slugify(team.name)}`}>
        <h3 className="team-card-title">{team.name}</h3>
      </Link>

      <div className="team-members-container">
        {team.members.map((member) => (
          <div key={member.id} className="member-entry">
            <Link href={`/people/${member.id}`}>
              <div className="member-name">{member.name}</div>
              <div className="member-info">
                {member.roleTitle && <div>Role: {member.roleTitle}</div>}
                {member.location && <div>Location: {member.location}</div>}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}