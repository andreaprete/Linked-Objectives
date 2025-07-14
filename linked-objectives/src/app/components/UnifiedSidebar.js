"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBullseye,
  FaUsers,
  FaUserCog,
  FaThLarge,
} from "react-icons/fa";
import Logo_sidebar from "@/app/components/Logo_sidebar";
import "@/app/styles/UnifiedSidebar.css";
import { useSession } from "next-auth/react";
import SickLogo from "./SickLogo";

const navItems = [
  {
    label: "Home",
    icon: FaHome,
    path: "/homepage",
    match: (pathname) =>
      pathname === "/homepage" || pathname.startsWith("/homepage/"),
  },
  {
    label: "Dashboard",
    icon: FaThLarge,
    path: "/dashboard",
    match: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Goals",
    icon: FaBullseye,
    path: "/objectives",
    match: (pathname) =>
      pathname === "/objectives" || pathname.startsWith("/objectives/"),
  },
  {
    label: "Teams",
    icon: FaUsers,
    path: "/teams",
    match: (pathname) =>
      pathname === "/teams" || pathname.startsWith("/teams/"),
  },
  {
    label: "People",
    icon: FaUserCog,
    path: "/people",
    match: (pathname) =>
      pathname === "/people" || pathname.startsWith("/people/"),
  },
  {
    label: "Strategy-Map",
    icon: FaThLarge,
    path: "/strategy-map",
    match: (pathname) => pathname === "/strategy-map",
  },
];

function SidebarItem({ icon: IconComponent, label, href, active }) {
  return (
    <li className={active ? "navItemActive" : "navItem"}>
      <Link href={href}>
        <IconComponent aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default function UnifiedSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [username, setUsername] = useState("user");

  useEffect(() => {
    async function fetchUsername() {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(
          `/api/getUsername?email=${encodeURIComponent(session.user.email)}`
        );
        const data = await res.json();

        if (data.username) {
          setUsername(data.username);
        } else {
          setUsername("user"); // fallback
        }
      } catch (err) {
        console.error("Failed to load username:", err);
        setUsername("user");
      }
    }

    fetchUsername();
  }, [session]);

  const activeItem = navItems.find((item) => item.match(pathname))?.label || "";

  return (
    <nav className="leftSidebar">
      <div className="sidebarLogoWrapper">
        <Logo_sidebar />

        <div
          className="logo-container"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: "0.3rem",
          }}
        >
          <span style={{ fontSize: "0.5rem", color: "#ffffff" }}>
            supported by
          </span>
          <SickLogo width="40px" style={{ marginBottom: 0 }} />
        </div>
      </div>
      <ul className="navList">
        {navItems.map((item) => {
          let href = item.path;
          if (item.label === "Home") {
            href = `/homepage/${username}`;
          }

          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={href}
              active={activeItem === item.label}
            />
          );
        })}
      </ul>
    </nav>
  );
}
