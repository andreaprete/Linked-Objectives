"use client";

import React, { useState, useEffect, useMemo } from 'react';
import "@/app/styles/Dashboard.css";

import AppLayout from '@/app/components/AppLayout';
import OkrVelocityChart from "@/app/components/OkrVelocityChart";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis,
  LineChart, Line
} from 'recharts';

const LIGHT_CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#06B6D4', '#6B7280'];

const getLightStatusColor = (status) => {
  const lowerStatus = status ? status.toLowerCase().replace(/\s+/g, '') : 'unknown';
  const colorMap = {
    inprogress: LIGHT_CHART_COLORS[0], done: LIGHT_CHART_COLORS[1], completed: LIGHT_CHART_COLORS[1],
    planned: LIGHT_CHART_COLORS[6], onhold: LIGHT_CHART_COLORS[2], aborted: LIGHT_CHART_COLORS[3],
    evaluating: LIGHT_CHART_COLORS[4], notstarted: LIGHT_CHART_COLORS[8], unknown: LIGHT_CHART_COLORS[8],
  };
  return colorMap[lowerStatus] || LIGHT_CHART_COLORS[8];
};

const AnimatedCard = ({ children, className = "", title, cardType = "widget", delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);
    const baseCardClass = cardType === "kpi" ? "kpiCard" : "widgetCard";
    return (
        <div className={`${baseCardClass} ${className} ${isVisible ? 'widgetVisible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            {title && <h3 className="widgetTitle">{title}</h3>}
            <div className={`widgetContentArea min-h-[250px]`}>
                {children}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, description, delay }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const jitterDelay = delay + Math.random() * 100;
        const timer = setTimeout(() => setIsVisible(true), jitterDelay);
        return () => clearTimeout(timer);
    }, [delay]);
    return (
        <div className={`kpiCard ${isVisible ? 'widgetVisible' : ''}`} style={{ transitionDelay: `${delay || 0}ms` }}>
            <div className="kpiValue">{value}</div>
            <div className="kpiLabel">{title}</div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    );
};

const ChartPlaceholder = ({ message = "No data available." }) => (
    <div className="chartPlaceholder">{message}</div>
);

function ObjectivesByStatusPieChart({ data }) {
    if (!data || data.length === 0) return <ChartPlaceholder message="No status data." />;
    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={70} innerRadius={35} dataKey="value" nameKey="name"
                    label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getLightStatusColor(entry.name)} stroke="#ffffff" strokeWidth={1.5} />
                    ))}
                </Pie>
                <Tooltip /> <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
}

function OverallProgressGaugeChart({ progress = 0 }) {
    const roundedProgress = Math.round(progress);
    const gaugeData = [{ name: 'Overall Progress', value: roundedProgress }];
    let progressColor = LIGHT_CHART_COLORS[0];
    if (roundedProgress >= 75) progressColor = LIGHT_CHART_COLORS[1];
    else if (roundedProgress <= 25) progressColor = LIGHT_CHART_COLORS[3];
    return (
        <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={25} data={gaugeData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#edf2f7' }} dataKey="value" angleAxisId={0} fill={progressColor} cornerRadius={12} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-current text-gray-700">{`${roundedProgress}%`}</text>
            </RadialBarChart>
        </ResponsiveContainer>
    );
}

function ObjectivesByCategoryBarChart({ data }) {
    const chartData = useMemo(() => data?.sort((a, b) => b.value - a.value) || [], [data]);
    if (!chartData || chartData.length === 0) return <ChartPlaceholder message="No category data." />;
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 opacity-75" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#4A5568' }} />
                <YAxis dataKey="name" type="category" width={110} interval={0} tick={{ fontSize: 11, fill: '#4A5568' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="value" name="Objectives" barSize={18}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LIGHT_CHART_COLORS[index % LIGHT_CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function ObjectivesByProgressDistributionChart({ data }) {
    const chartData = useMemo(() => data?.filter(d => d.value > 0) || [], [data]);
    if (!chartData || chartData.length === 0) return <ChartPlaceholder message="No progress distribution data." />;
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 20, right: 25, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 opacity-75" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A5568' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4A5568' }} />
                <Tooltip />
                <Bar dataKey="value" name="OKRs Count" barSize={25}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LIGHT_CHART_COLORS[index % LIGHT_CHART_COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function KeyResultScoresTrendChart({ data }) {
    const placeholderData = [
        { date: 'Jan', target: 0.8, score: 0.2 }, { date: 'Feb', target: 0.8, score: 0.3 },
        { date: 'Mar', target: 0.85, score: 0.5 }, { date: 'Apr', target: 0.9, score: 0.65 },
        { date: 'May', target: 0.9, score: 0.75 }, { date: 'Jun', target: 0.9, score: 0.8 }
    ];
    const chartData = (data && data.length > 0) ? data : placeholderData;
    const showPlaceholderMessage = !(data && data.length > 0);

    return (
        <>
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 5, right: 25, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 opacity-75" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A5568' }} />
                    <YAxis domain={[0, 1]} tickFormatter={(val) => (val * 100) + '%'} tick={{ fontSize: 11, fill: '#4A5568' }} />
                    <Tooltip formatter={(value, name) => [`${(typeof value === 'number' ? value * 100 : 0).toFixed(0)}%`, name]} />
                    <Legend iconType="plainline" />
                    <Line type="monotone" dataKey="target" name="Target" stroke={LIGHT_CHART_COLORS[8]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                    <Line type="monotone" dataKey="score" name="Score" stroke={LIGHT_CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
            {showPlaceholderMessage &&
                <p className="text-xs text-center text-gray-400 mt-1 w-full px-2">
                    Displaying sample trend. Real data pending backend implementation.
                </p>
            }
        </>
    );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const [summaryMetrics, setSummaryMetrics] = useState({});
  const [distributionData, setDistributionData] = useState({});
  const [keyResultScoresTrendData, setKeyResultScoresTrendData] = useState([]);
  const [objectiveVelocity, setObjectiveVelocity] = useState([]);

  // 🆕 Filters
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🧠 Dynamic fetch on filters
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          ...(selectedStatus && { status: selectedStatus }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        }).toString();

        const res = await fetch(`/api/dashboard?${query}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `API request failed: Status ${res.status}` }));
          throw new Error(errorData.error || `API request failed: Status ${res.status}`);
        }

        const data = await res.json();
        setSummaryMetrics(data.summaryMetrics || {});
        setDistributionData(data.distributions || {});
        setKeyResultScoresTrendData(data.keyResultScoresTrend || []);
        setObjectiveVelocity(data.objectiveVelocity || []);
        setTimeout(() => setIsFullyLoaded(true), 100);
      } catch (err) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedStatus, selectedCategory, startDate, endDate]);

  if (isLoading) {
    return (
      <AppLayout>
        <main className="dashboardContent flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-md text-gray-600">Loading Dashboard Data...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <main className="dashboardContent flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
          <h2 className="text-xl font-semibold text-red-500 mb-3">Data Fetching Error</h2>
          <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-5 max-w-lg">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors">
            Retry
          </button>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className={`dashboardContent space-y-5 md:space-y-6 transition-opacity duration-500 ease-out ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* 🧩 Filter Bar */}
        <section className="filterBar flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-md shadow-sm border">
          <label className="text-sm">
            Status:
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="ml-2 p-1 border rounded">
              <option value="">All</option>
              <option value="planned">Planned</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="done">Done</option>
              <option value="onhold">On Hold</option>
              <option value="aborted">Aborted</option>
            </select>
          </label>

          <label className="text-sm">
            Category:
            <input type="text" placeholder="e.g. Marketing" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="ml-2 p-1 border rounded" />
          </label>

          <label className="text-sm">
            Start Date:
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="ml-2 p-1 border rounded" />
          </label>

          <label className="text-sm">
            End Date:
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="ml-2 p-1 border rounded" />
          </label>
        </section>

        {/* KPI Cards */}
        <section className="kpiRow grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Themes" value={summaryMetrics.uniqueCategoryCount || 0} description="Unique Categories" delay={100} />
          <MetricCard title="Objectives" value={summaryMetrics.totalOkrCount || 0} delay={150} />
          <MetricCard title="Key Results" value={summaryMetrics.totalKrCount || 0} description="Total KRs" delay={200} />
        </section>

        {/* Main Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatedCard title="Objectives by Status" delay={300}>
            <ObjectivesByStatusPieChart data={distributionData.objectivesByStatus} />
          </AnimatedCard>
          <AnimatedCard title="Overall Progress (Active)" delay={350}>
            <OverallProgressGaugeChart progress={summaryMetrics.overallProgress} />
          </AnimatedCard>
          <AnimatedCard title="Objectives by Category" delay={400}>
            <ObjectivesByCategoryBarChart data={distributionData.objectivesByCategory} />
          </AnimatedCard>
          <AnimatedCard title="Objectives by Progress Range" delay={450}>
            <ObjectivesByProgressDistributionChart data={distributionData.objectivesByProgress} />
          </AnimatedCard>
          <AnimatedCard title="Key Result Scores Trend" delay={500}>
            <KeyResultScoresTrendChart data={keyResultScoresTrendData} />
          </AnimatedCard>
          <AnimatedCard title="OKR Creation Velocity" delay={550}>
            <OkrVelocityChart data={objectiveVelocity} />
          </AnimatedCard>
        </div>

      </main>
    </AppLayout>
  );
}