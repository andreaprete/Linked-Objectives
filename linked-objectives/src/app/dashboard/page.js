// src/app/dashboard/page.js
"use client";

import React, { useState, useEffect } from 'react';
import dashboardStyles from './Dashboard.module.css'; // Use dashboard styles

// --- Assumed Reusable Layout Components ---
import LeftSidebar from '@/app/components/Layout/LeftSidebar';
import TopBar from '@/app/components/Layout/TopBar';

// --- Import Recharts Components ---
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// --- Import date-fns ---
import { parseISO, differenceInDays, format } from 'date-fns';

// --- Icons (Example for Profile Header) ---
import { FaUserCircle } from 'react-icons/fa';

// --- Mock Data ---
const MOCK_USER_OKRS = [
    { id: 'OKR4', title: 'Improve Development Skills', status: 'InProgress', progress: 65, keyResultsCount: 3, dueDate: '2025-06-30' },
    { id: 'OKR5', title: 'Contribute to Team Project X', status: 'InProgress', progress: 80, keyResultsCount: 2, dueDate: '2025-05-20' },
    { id: 'OKR6', title: 'Client Communication Enhancement', status: 'NotStarted', progress: 0, keyResultsCount: 4, dueDate: '2025-07-15' },
    { id: 'OKR1', title: 'Market Leadership (Shared)', status: 'Done', progress: 100, keyResultsCount: 2, dueDate: '2025-04-30' },
    { id: 'OKR7', title: 'Learn New JS Framework', status: 'InProgress', progress: 25, keyResultsCount: 3, dueDate: '2025-05-31' },
];
const MOCK_ACTIVITY_FEED = [
    { id: 'a1', user: 'Alice', action: 'updated progress for KR 4.1', timestamp: '35m ago'}, { id: 'a2', user: 'Bob', action: 'commented on OKR5', timestamp: '1h ago'},
    { id: 'a3', user: 'You', action: 'created OKR6', timestamp: '3h ago'}, { id: 'a4', user: 'Alice', action: 'marked OKR1 as Done', timestamp: 'yesterday'},
    { id: 'a5', user: 'System', action: 'KR 5.2 is approaching deadline', timestamp: 'yesterday'}, { id: 'a6', user: 'Charlie', action: 'assigned OKR7 to you', timestamp: '2 days ago'},
];
const MOCK_DASHBOARD_NOTIFICATIONS = [
    { id: 2, text: "KR 5.2 is nearing its due date", important: true}, { id: 1, text: "Bob commented on OKR5", important: false},
    { id: 3, text: "OKR6 (Client Comms) assigned to you", important: true}, { id: 4, text: "Reminder: Update OKR4 progress", important: false},
];
const MOCK_PROGRESS_DATA = [
  { week: 'W1', progress: 10 }, { week: 'W2', progress: 15 }, { week: 'W3', progress: 30 }, { week: 'W4', progress: 45 },
  { week: 'W5', progress: 60 }, { week: 'W6', progress: 75 }, { week: 'W7', progress: 85 }, { week: 'W8', progress: 90 },
];


// --- Recharts Progress Chart Component ---
function ProgressChart({ data }) {
     if (!data || data.length === 0) { return <div className={dashboardStyles.progressGraphPlaceholder}>No progress data available.</div>; }
     return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="week" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} itemStyle={{ color: '#007bff' }} formatter={(value) => [`${value}%`, "Progress"]} />
                <Line type="monotone" dataKey="progress" stroke="#007bff" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 4, fill: '#007bff' }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

// --- Helper to get status class ---
const getStatusClass = (status) => {
    if (status === 'InProgress') return dashboardStyles.statusInProgress;
    if (status === 'Done') return dashboardStyles.statusDone;
    return dashboardStyles.statusNotStarted;
};


// --- Main Dashboard Page Component ---
export default function DashboardPage() {
    const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // For animation

    // Effect for load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSidebarClick = (itemName) => { setActiveSidebarItem(itemName); };

    // Calculate KPIs & Deadlines
    const activeOkrCount = MOCK_USER_OKRS.filter(okr => okr.status === 'InProgress').length;
    const totalKrCount = MOCK_USER_OKRS.reduce((sum, okr) => sum + (okr.keyResultsCount || 0), 0);
    const inProgressOkrs = MOCK_USER_OKRS.filter(okr => okr.status === 'InProgress');
    const overallProgress = inProgressOkrs.length > 0 ? Math.round(inProgressOkrs.reduce((sum, okr) => sum + okr.progress, 0) / inProgressOkrs.length) : 0;
    const now = new Date();
    const upcomingDeadlines = MOCK_USER_OKRS
        .filter(okr => okr.status !== 'Done' && okr.dueDate)
        .map(okr => ({ ...okr, parsedDate: parseISO(okr.dueDate), daysRemaining: differenceInDays(parseISO(okr.dueDate), now) }))
        .filter(okr => okr.daysRemaining >= 0 && okr.daysRemaining <= 30)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return (
        <div className={dashboardStyles.pageWrapper}>
            <LeftSidebar activeItem={activeSidebarItem} onNavItemClick={handleSidebarClick} />
            <div className={dashboardStyles.rightContentWrapper}>
                <TopBar pageTitle="Dashboard" />

                <main className={dashboardStyles.dashboardContent}>
                    {/* Profile Header */}
                    <div className={`${dashboardStyles.profileHeader} ${isLoaded ? dashboardStyles.widgetVisible : ''}`}>
                         <div className={dashboardStyles.profileHeaderPic}> <FaUserCircle /> </div>
                         <div className={dashboardStyles.profileHeaderText}> <h2>Welcome back, User!</h2> <p>Here's an overview of your Objectives and Key Results.</p> </div>
                    </div>

                    {/* KPI Row */}
                    <div className={dashboardStyles.kpiRow}>
                         <div className={`${dashboardStyles.kpiCard} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.1s' }}> <div className={dashboardStyles.kpiValue}>{activeOkrCount}</div> <div className={dashboardStyles.kpiLabel}>Active Objectives</div> </div>
                         <div className={`${dashboardStyles.kpiCard} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.2s' }}> <div className={dashboardStyles.kpiValue}>{totalKrCount}</div> <div className={dashboardStyles.kpiLabel}>Total Key Results</div> </div>
                         <div className={`${dashboardStyles.kpiCard} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.3s' }}> <div className={dashboardStyles.kpiValue}>{overallProgress}%</div> <div className={dashboardStyles.kpiLabel}>Avg. OKR Progress</div> </div>
                    </div>

                    {/* --- Dashboard Grid (Static CSS Grid) --- */}
                    {isLoaded && (
                        <div className={dashboardStyles.dashboardGrid}>

                            {/* --- OKR Widget --- */}
                            <div className={`${dashboardStyles.widgetCard} ${dashboardStyles.okrWidget} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.4s' }}>
                                <h2 className={dashboardStyles.widgetTitle}>My Assigned OKRs</h2>
                                {isLoading ? <p>Loading...</p> : <ul className={dashboardStyles.okrList}> {MOCK_USER_OKRS.map(okr => ( <li key={okr.id} className={dashboardStyles.okrItem}> <span className={dashboardStyles.okrTitle}>{okr.title}</span> <div className={dashboardStyles.okrDetails}> <div className={dashboardStyles.okrProgressWrap} title={`Progress: ${okr.progress}%`}> <div className={dashboardStyles.okrProgressBar} style={{ width: `${okr.progress}%` }} data-status={okr.status} ></div> </div> <span className={`${dashboardStyles.okrStatus} ${getStatusClass(okr.status)}`}> {okr.status === 'InProgress' ? 'In Progress' : okr.status} </span> </div> </li> ))} </ul>}
                            </div>

                            {/* --- Activity Widget --- */}
                            <div className={`${dashboardStyles.widgetCard} ${dashboardStyles.activityWidget} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.5s' }}>
                                <h2 className={dashboardStyles.widgetTitle}>Activity Feed</h2>
                                {isLoading ? <p>Loading...</p> : <ul className={dashboardStyles.activityFeed}> { MOCK_ACTIVITY_FEED.map(activity => ( <li key={activity.id} className={dashboardStyles.activityItem}> <span className={dashboardStyles.activityUser}>{activity.user}</span> <span> {activity.action}</span> <span className={dashboardStyles.activityTime}>{activity.timestamp}</span> </li> ))} </ul>}
                            </div>

                            {/* --- Deadlines Widget --- */}
                            <div className={`${dashboardStyles.widgetCard} ${dashboardStyles.deadlinesWidget} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.6s' }}>
                                <h2 className={dashboardStyles.widgetTitle}>Upcoming Deadlines (Next 30d)</h2>
                                {isLoading ? <p>Loading...</p> : <ul className={dashboardStyles.deadlinesList}> {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(okr => ( <li key={okr.id} className={dashboardStyles.deadlineItem}> <span className={dashboardStyles.deadlineTitle}>{okr.title}</span> <span className={`${dashboardStyles.deadlineDate} ${okr.daysRemaining < 7 ? '' : dashboardStyles.deadlineDateSoon}`}> {format(okr.parsedDate, 'MMM do')} ({okr.daysRemaining}d) </span> </li> )) : ( <li className={dashboardStyles.deadlineItem}>No upcoming deadlines.</li> )} </ul>}
                            </div>

                            {/* --- Notifications Widget --- */}
                            <div className={`${dashboardStyles.widgetCard} ${dashboardStyles.notificationsWidget} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.7s' }}>
                                <h2 className={dashboardStyles.widgetTitle}>Key Notifications</h2>
                                {isLoading ? <p>Loading...</p> : <ul className={dashboardStyles.notificationsList}> { MOCK_DASHBOARD_NOTIFICATIONS.map(n => ( <li key={n.id} className={`${dashboardStyles.notificationItem} ${n.important ? dashboardStyles.notificationImportant : ''}`}> {n.text} </li> ))} {MOCK_DASHBOARD_NOTIFICATIONS.length > 0 && ( <li style={{ marginTop: '15px', textAlign: 'right' }}> <a href="#" onClick={(e)=>e.preventDefault()} className={dashboardStyles.notificationLink}>View All Notifications</a> </li> )} {MOCK_DASHBOARD_NOTIFICATIONS.length === 0 && ( <li className={dashboardStyles.notificationItem}>No important notifications.</li> )} </ul>}
                            </div>

                            {/* --- Progress Graph Widget --- */}
                            <div className={`${dashboardStyles.widgetCard} ${dashboardStyles.progressWidget} ${isLoaded ? dashboardStyles.widgetVisible : ''}`} style={{ transitionDelay: '0.8s' }}>
                                <h2 className={dashboardStyles.widgetTitle}>Progress Overview</h2>
                                <div className={dashboardStyles.progressChartContainer}>
                                    {isLoading ? <p>Loading...</p> : <ProgressChart data={MOCK_PROGRESS_DATA} />}
                                </div>
                            </div>

                        </div>
                     )}
                </main>
            </div>
        </div>
    );
}

// Ensure ProgressChart component and getStatusClass helper are defined
// Ensure LeftSidebar and TopBar components are correctly imported