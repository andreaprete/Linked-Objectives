// src/components/Layout/LeftSidebar.js
"use client"; // Keep client directive if using hooks/handlers, though maybe not needed if just props

import React from 'react';
import "@/app/styles/LeftSidebar.css"
import { FaHome, FaBullseye, FaUsers, FaUserCog, FaThLarge } from 'react-icons/fa'; // Import icons here

// Sidebar Item Component (can be internal or separate)
function SidebarItem({ icon, label, isActive, onClick }) {
    const IconComponent = icon;
    const itemClass = isActive ? "navItemActive" : "navItem";
    return (
        <li className={itemClass}>
            <button onClick={onClick}>
                {IconComponent && <IconComponent aria-hidden="true" />} {/* Add aria-hidden for decorative icons */}
                <span>{label}</span>
            </button>
        </li>
    );
}

function LeftSidebar({ activeItem, onNavItemClick }) {
  // Default handler if none provided
  const handleClick = onNavItemClick || ((itemName) => console.log(`${itemName} clicked`));

  return (
    <nav className="leftSidebar">
      <h2 className="sidebarTitle">OKR Tool</h2>
      <ul className="navList">
        <SidebarItem
          icon={FaHome}
          label="Home"
          isActive={activeItem === 'Home'}
          onClick={() => handleClick('Home')}
        />
        <SidebarItem
          icon={FaThLarge}
          label="Dashboard"
          isActive={activeItem === 'Dashboard'}
          onClick={() => handleClick('Dashboard')}
        />
        <SidebarItem
          icon={FaBullseye}
          label="Goals"
          isActive={activeItem === 'Goals'}
          onClick={() => handleClick('Goals')}
        />
        <SidebarItem
          icon={FaUsers}
          label="Teams"
          isActive={activeItem === 'Teams'}
          onClick={() => handleClick('Teams')}
        />
        <SidebarItem
          icon={FaUserCog}
          label="Users"
          isActive={activeItem === 'Users'}
          onClick={() => handleClick('Users')}
        />
        <SidebarItem
          icon={FaThLarge} // Re-using icon, change if needed
          label="Editor"
          isActive={activeItem === 'Editor'}
          onClick={() => handleClick('Editor')}
        />
      </ul>
    </nav>
  );
}

export default LeftSidebar;