// src/components/UnifiedSidebar.js
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaBullseye, FaUsers, FaUserCog, FaThLarge } from 'react-icons/fa';
import "@/app/styles/UnifiedSidebar.css"; 

const navItems = [
  { label: 'Home', icon: FaHome, path: '/homepage' },
  { label: 'Dashboard', icon: FaThLarge, path: '/dashboard' },
  { label: 'Goals', icon: FaBullseye, path: '/objectives' },
  { label: 'Teams', icon: FaUsers, path: '/teams' },
  { label: 'Users', icon: FaUserCog, path: '/users' },
  { label: 'Strategy-Map', icon: FaThLarge, path: '/strategy-map' }
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

  // Figure out which item is active by path matching
  function getActiveItem() {
    const found = navItems.find(item => pathname.startsWith(item.path));
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
