"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import "@/app/styles/UnifiedTopBar.css";

const routeTitleMap = {
  "/homepage": "Home",
  "/dashboard": "Dashboard",
  "/objectiveslist": "Goals",
  "/teams": "Teams",
  "/people": "Users",
  "/strategy-map": "Strategy Map",
};

function getStaticTitle(pathname) {
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];
  const found = Object.keys(routeTitleMap).find((key) =>
    pathname.startsWith(key)
  );
  return found ? routeTitleMap[found] : null;
}

export default function UnifiedTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [initials, setInitials] = useState("U");
  const [fullName, setFullName] = useState("User");
  const [username, setUsername] = useState("user");
  const [dynamicTitle, setDynamicTitle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const [resource, id] = parts;

    const staticTitle = getStaticTitle(pathname);
    if (staticTitle) {
      setDynamicTitle(staticTitle);
      return;
    }

    async function fetchTitle() {
      if (!id) return;

      let url = null;
      if (resource === "objectives") {
        url = `/api/objectives/${id}`;
      } else if (resource === "key-results") {
        url = `/api/key-results/${id}`;
      }

      if (url) {
        try {
          const res = await fetch(url);
          const json = await res.json();
          setDynamicTitle(json.data?.title || id.replace(/-/g, " "));
        } catch {
          setDynamicTitle(id.replace(/-/g, " "));
        }
      } else {
        setDynamicTitle(id.replace(/-/g, " "));
      }
    }

    fetchTitle();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchInitials() {
      try {
        const res = await fetch(`/api/getUsername?email=${session.user.email}`);
        const json = await res.json()
        const name = json.fullname || "User";
        const parts = name.trim().split(/\s+/);
        setFullName(name);
        setUsername(json.username || "user");
        console.log("🔍 Split parts:", parts);
        let initials = "";
        if (parts.length >= 2) {
          initials = parts[0][0] + parts[1][0];
        } else if (parts.length === 1) {
          initials = parts[0].substring(0, 2);
        } else {
          initials = "US";
        }

        setInitials(initials.toUpperCase());
      } catch (err) {
        setInitials("US");
      }
    }

    fetchInitials();
  }, [session]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{dynamicTitle || "Objectives"}</div>
      <div className="topbar-user-wrapper">
        <div className="topbar-user-avatar">
          <span>{initials}</span>
        </div>

        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-name">{fullName}</div>
            <div className="dropdown-email">{session?.user?.email}</div>
          </div>
          <hr />
          <div onClick={() => router.push(`/homepage/${username}`)}>My Homepage</div>
          <div onClick={() => router.push(`/people/${username}`)}>View Profile</div>
          <div onClick={handleLogout}>Log Out</div>
        </div>
      </div>
    </header>
  );
}
