// src/components/Layout/TopBar.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import "@/app/styles/TopBar.css"
import { FaBell, FaUserCircle } from 'react-icons/fa';

// Mock data (should ideally come from props or context)
const MOCK_NOTIFICATIONS = [
    { id: 1, text: "User X commented on OKR 1", time: "10m ago"},
    { id: 2, text: "KR 2.1 is nearing its due date", time: "1h ago"},
    { id: 3, text: "New Goal 'Project Phoenix' created", time: "2h ago"},
];

// Internal Dropdown Component
function DropdownMenu({ children, style }) {
    return ( <div className="dropdown" style={style}> {children} </div> );
}

function TopBar({ pageTitle = "Page", canvasName = "Untitled", onNewCanvasClick = () => {} }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const questionMarkRef = useRef(null);
  const notificationsButtonRef = useRef(null); // Ref for notification button
  const profileButtonRef = useRef(null);     // Ref for profile button
  const notificationsDropdownRef = useRef(null); // Ref for notification dropdown
  const profileDropdownRef = useRef(null);       // Ref for profile dropdown


  const toggleNotifications = () => {
      setShowProfile(false);
      setShowNotifications(prev => !prev);
  };

  const toggleProfile = () => {
      setShowNotifications(false);
      setShowProfile(prev => !prev);
  };

   // Improved outside click detection
   useEffect(() => {
    const handleClickOutside = (event) => {
      // Check notifications dropdown
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target) &&
          notificationsButtonRef.current && !notificationsButtonRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Check profile dropdown
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) &&
          profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    // Add listener only when a dropdown is open
    if (showNotifications || showProfile) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showProfile]); // Dependencies


  const handleQuestionMarkHover = (isHovering) => {
      if (isHovering && questionMarkRef.current) {
          const rect = questionMarkRef.current.getBoundingClientRect();
          setTooltipContent("Get help or learn more about this page."); // Generic help text
          setTooltipPosition({ top: rect.bottom + 8, left: rect.left + (rect.width / 2) });
          setShowTooltip(true);
      } else {
          setShowTooltip(false);
      }
  };

  const handleQuestionMarkClick = () => {
      alert(`Help clicked for ${pageTitle}!`); // Use pageTitle prop
      setShowTooltip(false);
  };


  return (
    <header className="topBar">
      <div className="topLeft">
        <h1 className="pageHeading">
            {pageTitle} {/* Use prop */}
            <span
                ref={questionMarkRef}
                className="questionMark"
                onMouseEnter={() => handleQuestionMarkHover(true)}
                onMouseLeave={() => handleQuestionMarkHover(false)}
                onClick={handleQuestionMarkClick}
                title="Help"
            >?</span>
        </h1>
        {/* Conditionally render canvas buttons only if needed based on page? Or pass as children? */}
        {/* For now, assuming they are specific to Strategy Map, maybe pass them via props if needed here */}
        {pageTitle === "Editor Map" && (
             <div className="topCanvasButtons">
                <button className="button" title="Current canvas name">
                    {canvasName}
                </button>
                <button className= "button buttonPrimary" onClick={onNewCanvasClick}>
                    + New canvas
                </button>
             </div>
        )}
      </div>
      <div className="topRight">
          <input type="search" placeholder="Search globally..." className="globalSearchInput" />
          <div style={{ position: 'relative' }} ref={notificationsButtonRef}>
              <button className="iconButton" onClick={toggleNotifications} title="Notifications"> <FaBell /> </button>
              {showNotifications && (
                  <div ref={notificationsDropdownRef}> {/* Ref for click outside */}
                      <DropdownMenu style={{ right: '0px', top: '45px' }}>
                          <h4>Notifications</h4> <hr/>
                          {MOCK_NOTIFICATIONS.length > 0 ? MOCK_NOTIFICATIONS.map(n => ( <div key={n.id} className="notificationItem"> {n.text}<br/><small style={{color: '#777'}}>{n.time}</small> </div> )) : <p>No new notifications.</p>}
                      </DropdownMenu>
                  </div>
              )}
          </div>
          <div style={{ position: 'relative' }} ref={profileButtonRef}>
              <button className="iconButton" onClick={toggleProfile} title="Profile"> <div className="profilePic"> <FaUserCircle size="0.8em" /> </div> </button>
              {showProfile && (
                  <div ref={profileDropdownRef}> {/* Ref for click outside */}
                      <DropdownMenu style={{ right: '0px', top: '45px' }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}> <div className="profilePic" style={{width: '40px', height: '40px'}}> <FaUserCircle size="1.2em" /> </div> <div> <strong>User Name</strong><br/><small>user.email@example.com</small> </div> </div> <hr/>
                          <button className="button" style={{width: '100%', marginBottom: '5px'}}>Settings</button>
                          <button className="button" style={{width: '100%'}}>Logout</button>
                      </DropdownMenu>
                  </div>
              )}
          </div>
      </div>
       {/* Tooltip Element */}
       {showTooltip && ( <div className="tooltip" style={{ top: tooltipPosition.top, left: tooltipPosition.left }}> {tooltipContent} </div> )}
    </header>
  );
}

export default TopBar;