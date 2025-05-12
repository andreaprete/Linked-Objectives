// src/components/Layout/LeftSidebar.js
"use client"; // Keep client directive if using hooks/handlers, though maybe not needed if just props

import React from 'react';
import styles from './LeftSidebar.module.css';
import { FaHome, FaBullseye, FaUsers, FaUserCog, FaThLarge } from 'react-icons/fa'; // Import icons here

// Sidebar Item Component (can be internal or separate)
function SidebarItem({ icon, label, isActive, onClick }) {
    const IconComponent = icon;
    const itemClass = isActive ? styles.navItemActive : styles.navItem;
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
    <nav className={styles.leftSidebar}>
      <h2 className={styles.sidebarTitle}>OKR Tool</h2>
      <ul className={styles.navList}>
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