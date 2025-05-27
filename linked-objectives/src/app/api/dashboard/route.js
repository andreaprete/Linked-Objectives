import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.toLowerCase();
    const category = searchParams.get("category")?.toLowerCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const mockFilePath = path.resolve(
      process.cwd(),
      'src/mock/data.json'
    );
    const raw = await fs.readFile(mockFilePath, 'utf-8');
    const mockData = JSON.parse(raw);

    const userOkrs = mockData.objectives;
    const krTrend = mockData.krTrend;

    return createDashboardResponse(userOkrs, krTrend, { status, category, startDate, endDate });

  } catch (err) {
    console.error("[MOCK API Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📦 Shared response generator
function createDashboardResponse(objectives, krTrend, filters) {
  let userOkrs = [...objectives];
  const { status, category, startDate, endDate } = filters;

  if (status) {
    userOkrs = userOkrs.filter(o =>
      o.statusName?.toLowerCase().includes(status)
    );
  }
  if (category) {
    userOkrs = userOkrs.filter(o =>
      o.categoryName?.toLowerCase().includes(category)
    );
  }
  if (startDate) {
    userOkrs = userOkrs.filter(o =>
      o.createdDate && new Date(o.createdDate) >= new Date(startDate)
    );
  }
  if (endDate) {
    userOkrs = userOkrs.filter(o =>
      o.createdDate && new Date(o.createdDate) <= new Date(endDate)
    );
  }

  const totalOkrCount = userOkrs.length;
  const activeOkrs = userOkrs.filter(o =>
    o.statusName.toLowerCase().includes("in progress")
  );
  const overallProgress = activeOkrs.length
    ? Math.round(activeOkrs.reduce((acc, o) => acc + o.progress, 0) / activeOkrs.length)
    : 0;
  const totalKrCount = userOkrs.reduce((acc, o) => acc + o.keyResultsCount, 0);
  const uniqueCategoryCount = new Set(userOkrs.map(o => o.categoryName)).size;

  const byMonth = {};
  userOkrs.forEach(o => {
    if (!o.createdDate) return;
    const d = new Date(o.createdDate);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[label] = (byMonth[label] || 0) + 1;
  });

  const objectiveVelocity = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));

  const statusMap = {}, categoryMap = {}, progressMap = {
    "0%": 0, "1-25%": 0, "26-50%": 0,
    "51-75%": 0, "76-99%": 0, "100%": 0
  };

  userOkrs.forEach(o => {
    statusMap[o.statusName] = (statusMap[o.statusName] || 0) + 1;
    categoryMap[o.categoryName] = (categoryMap[o.categoryName] || 0) + 1;
    const p = o.progress;
    if (p === 0) progressMap["0%"]++;
    else if (p <= 25) progressMap["1-25%"]++;
    else if (p <= 50) progressMap["26-50%"]++;
    else if (p <= 75) progressMap["51-75%"]++;
    else if (p < 100) progressMap["76-99%"]++;
    else progressMap["100%"]++;
  });

  return NextResponse.json({
    summaryMetrics: {
      totalOkrCount,
      overallProgress,
      totalKrCount,
      uniqueCategoryCount
    },
    objectiveVelocity,
    keyResultScoresTrend: krTrend,
    distributions: {
      objectivesByStatus: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      objectivesByCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      objectivesByProgress: Object.entries(progressMap)
        .map(([name, value]) => ({ name, value }))
        .filter(entry => entry.value > 0)
    }
  });
}
