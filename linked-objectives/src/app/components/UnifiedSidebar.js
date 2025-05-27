"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaBullseye, FaUsers, FaUserCog, FaThLarge } from 'react-icons/fa';
import "@/app/styles/UnifiedSidebar.css"; 

const navItems = [
  {
    label: 'Home',
    icon: FaHome,
    path: '/homepage',
    match: (pathname) => pathname === '/homepage' || pathname === '/',
  },
  {
    label: 'Dashboard',
    icon: FaThLarge,
    path: '/dashboard',
    match: (pathname) => pathname === '/dashboard',
  },
  {
    label: 'Goals',
    icon: FaBullseye,
    path: '/objectiveslist',
    match: (pathname) =>
      pathname === '/objectiveslist' || pathname.startsWith('/objectives/'),
  },
  {
    label: 'Teams',
    icon: FaUsers,
    path: '/teamslist',
    match: (pathname) =>
      pathname === '/teamslist' || pathname.startsWith('/teams/'),
  },
  {
    label: 'People',
    icon: FaUserCog,
    path: '/peoplelist',
    match: (pathname) =>
      pathname === '/peoplelist' || pathname.startsWith('/people/'),
  },
  {
    label: 'Strategy-Map',
    icon: FaThLarge,
    path: '/strategy-map',
    match: (pathname) => pathname === '/strategy-map',
  }
];

function SidebarItem({ icon, label, active, onClick }) {
  const IconComponent = icon;
  return (
    <li className={active ? "navItemActive" : "navItem"}>
      <button onClick={onClick}>
        <IconComponent aria-hidden="true" />
        <span>{label}</span>
      </button>
    </li>
  );
}

export default function UnifiedSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function getActiveItem() {
    const found = navItems.find(item => item.match(pathname));
    return found ? found.label : '';
  }
  const activeItem = getActiveItem();

  return (
    <nav className="leftSidebar">
      <h2 className="sidebarTitle">OKR Tool</h2>
      <ul className="navList">
        {navItems.map(item => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.label}
            onClick={() => router.push(item.path)}
          />
        ))}
      </ul>
    </nav>
  );
}
