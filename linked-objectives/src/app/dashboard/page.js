"use client";

import React, { useState, useEffect } from 'react';
import "@/app/styles/Dashboard.css";

import LeftSidebar from '@/app/components/Layout/LeftSidebar';
import TopBar from '@/app/components/Layout/TopBar';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { parseISO, differenceInDays, format } from 'date-fns';

// import { FaUserCircle } from 'react-icons/fa';

const MOCK_USER_OKRS = [
    { id: 'OKR4', title: 'Improve Development Skills', status: 'InProgress', progress: 65, keyResultsCount: 3, dueDate: '2025-06-30' },
    { id: 'OKR5', title: 'Contribute to Team Project X', status: 'InProgress', progress: 80, keyResultsCount: 2, dueDate: '2025-05-20' },
    { id: 'OKR6', title: 'Client Communication Enhancement', status: 'NotStarted', progress: 0, keyResultsCount: 4, dueDate: '2025-07-15' },
    { id: 'OKR1', title: 'Market Leadership (Shared)', status: 'Done', progress: 100, keyResultsCount: 2, dueDate: '2025-04-30' },
    { id: 'OKR7', title: 'Learn New JS Framework', status: 'InProgress', status: 'InProgress', progress: 25, keyResultsCount: 3, dueDate: '2025-05-31' },
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


const defaultDotStyle = { r: 4, fill: '#007bff' };
const defaultActiveDotStyle = { r: 6, fill: '#007bff' };

function ProgressChart({ data }) {
     if (!data || data.length === 0) { return <div className="progress-graph-placeholder">No progress data available.</div>; }
     return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="week" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentClassName="dashboard-tooltip-content"
                  itemClassName="dashboard-tooltip-item"
                  formatter={(value) => [`${value}%`, "Progress"]}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#007bff"
                  strokeWidth={2}
                  activeDot={defaultActiveDotStyle}
                  dot={defaultDotStyle}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

const getStatusClass = (status) => {
    if (status === 'InProgress') return 'status-in-progress';
    if (status === 'Done') return 'status-done';
    return 'status-not-started';
};


export default function DashboardPage() {
    const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSidebarClick = (itemName) => { setActiveSidebarItem(itemName); };

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
        <div className="page-wrapper">
            <LeftSidebar activeItem={activeSidebarItem} onNavItemClick={handleSidebarClick} />
            <div className="right-content-wrapper">
                <TopBar pageTitle="Dashboard" />

                <main className="dashboard-content">
                </main>
              
                </div>
            </div>
        );
}