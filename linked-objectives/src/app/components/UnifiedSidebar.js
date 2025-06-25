"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaBullseye, FaUsers, FaUserCog, FaThLarge } from 'react-icons/fa';
import Logo_sidebar from '@/app/components/Logo_sidebar';
import "@/app/styles/UnifiedSidebar.css";
import { useSession } from "next-auth/react";
import { useLoading } from "@/app/contexts/LoadingContext";


const navItems = [
  {
    label: 'Home',
    icon: FaHome,
    path: '/homepage',
    match: (pathname) =>
      pathname === '/homepage' || pathname.startsWith('/homepage/'),
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
    path: '/objectives',
    match: (pathname) =>
      pathname === '/objectives' || pathname.startsWith('/objectives/'),
  },
  {
    label: 'Teams',
    icon: FaUsers,
    path: '/teams',
    match: (pathname) =>
      pathname === '/teams' || pathname.startsWith('/teams/'),
  },
  {
    label: 'People',
    icon: FaUserCog,
    path: '/people',
    match: (pathname) =>
      pathname === '/people' || pathname.startsWith('/people/'),
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
  const { data: session } = useSession();
  const { startLoading, stopLoading } = useLoading();
  const { startPageTransition, stopPageTransition } = useLoading();
  const email = session?.user?.email;
  const [username, setUsername] = useState("user");

  useEffect(() => {
    async function fetchUsername() {
      if (!email) return;
      try {
        const res = await fetch(`/api/getUsername?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        setUsername(json.username || "user");
      } catch {
        setUsername("user");
      }
    }

    fetchUsername();
  }, [email]);

  const getActiveItem = () => {
    const found = navItems.find(item => item.match(pathname));
    return found ? found.label : '';
  };

  const activeItem = getActiveItem();

  return (
    <nav className="leftSidebar">
      <div className="sidebarLogoWrapper">
        <Logo_sidebar />
      </div>
      <ul className="navList">
        {navItems.map(item => {
          let path = item.path;
          if (item.label === "Home") {
            path = `/homepage/${username}`;
          }

          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.label}
             onClick={() => {
              startPageTransition(`Loading ${item.label}...`);
              router.push(path);
            }}
            />
          );
        })}
      </ul>
    </nav>
  );
}
