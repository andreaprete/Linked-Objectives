import { NextResponse } from 'next/server';

const GRAPHDB_URL = process.env.GRAPHDB_URL || 'http://localhost:7200';
const REPOSITORY_ID = process.env.GRAPHDB_REPOSITORY || 'linked-objectives';

async function queryGraphDB(query, context = '') {
  const endpoint = `${GRAPHDB_URL}/repositories/${REPOSITORY_ID}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    body: query,
  });
  if (!res.ok) throw new Error(`[GraphDB ERROR - ${context}]: ${res.statusText}`);
  return await res.json();
}

const PREFIXES = `
PREFIX : <https://data.sick.com/res/dev/examples/linked-objectives-okrs/>
PREFIX objectives_voc: <https://data.sick.com/voc/sam/objectives-model/>
PREFIX lifecycle_voc: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX dct: <http://purl.org/dc/terms/>
`;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.toLowerCase();
    const category = searchParams.get("category")?.toLowerCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const objectivesQuery = `
      ${PREFIXES}
      SELECT ?okr ?title ?dueDate ?createdDate ?modifiedDate ?startDate ?endDate
             (SAMPLE(?categoryEnLabel) AS ?categoryName)
             (SAMPLE(?statusEnLabel) AS ?statusName)
             (COUNT(DISTINCT ?kr) AS ?keyResultsCount)
             (AVG(xsd:decimal(?progressVal)) AS ?objectiveProgress)
      WHERE {
        ?okr a objectives_voc:Objective ;
             rdfs:label ?title .
        OPTIONAL { ?okr objectives_voc:category/skos:prefLabel ?categoryEnLabel . FILTER(LANG(?categoryEnLabel) = "en") }
        OPTIONAL { ?okr lifecycle_voc:state/skos:prefLabel ?statusEnLabel . FILTER(LANG(?statusEnLabel) = "en") }
        OPTIONAL { ?okr dct:temporal/time:hasEnd ?dueDate . }
        OPTIONAL { ?okr dct:created ?createdDate . }
        OPTIONAL { ?okr dct:modified ?modifiedDate . }
        OPTIONAL { ?okr objectives_voc:hasKeyResult ?kr . }
        OPTIONAL { ?kr objectives_voc:progress ?progressVal . }
        OPTIONAL {
          ?okr dct:temporal ?interval .
          OPTIONAL { ?interval time:hasBeginning ?startDate . }
          OPTIONAL { ?interval time:hasEnd ?endDate . }
        }
      }
      GROUP BY ?okr ?title ?dueDate ?createdDate ?modifiedDate ?startDate ?endDate
    `;

    const krTrendQuery = `
      ${PREFIXES}
      SELECT ?kr ?date ?score
      WHERE {
        ?event a :ProgressUpdate ;
               :score ?score ;
               dct:date ?date ;
               :aboutKeyResult ?kr .
      }
      ORDER BY ?kr ?date
    `;

    const totalKrQuery = `
      ${PREFIXES}
      SELECT (COUNT(DISTINCT ?kr) AS ?trueKrCount)
      WHERE {
        ?kr a objectives_voc:KeyResult .
      }
    `;

    const [objectiveResults, krTrendResults, krCountResults] = await Promise.all([
      queryGraphDB(objectivesQuery, "Objectives"),
      queryGraphDB(krTrendQuery, "KR Trend"),
      queryGraphDB(totalKrQuery, "KR Global Count")
    ]);

    let userOkrs = objectiveResults.results.bindings.map(b => ({
      id: b.okr.value.split("/").pop(),
      title: b.title?.value,
      categoryName: b.categoryName?.value || "Uncategorized",
      statusName: b.statusName?.value || "Unknown",
      dueDate: b.dueDate?.value,
      createdDate: b.createdDate?.value,
      modifiedDate: b.modifiedDate?.value,
      startDate: b.startDate?.value || null,
      endDate: b.endDate?.value || null,
      keyResultsCount: parseInt(b.keyResultsCount?.value || '0'),
      progress: b.objectiveProgress?.value
        ? Math.round(parseFloat(b.objectiveProgress.value) * 100)
        : 0
    }));

    const uniqueOkrsMap = new Map();
    userOkrs.forEach(o => {
      if (!uniqueOkrsMap.has(o.id)) uniqueOkrsMap.set(o.id, o);
    });
    userOkrs = Array.from(uniqueOkrsMap.values());

    const krTrend = krTrendResults.results.bindings.map(b => ({
      kr: b.kr.value.split("/").pop(),
      date: b.date.value,
      score: parseFloat(b.score.value)
    }));

    // Apply filters
    let filteredOkrs = [...userOkrs];
    if (status) {
      filteredOkrs = filteredOkrs.filter(o =>
        o.statusName?.toLowerCase().includes(status)
      );
    }
    if (category) {
      filteredOkrs = filteredOkrs.filter(o =>
        o.categoryName?.toLowerCase().includes(category)
      );
    }
    if (startDate) {
      filteredOkrs = filteredOkrs.filter(o =>
        o.createdDate && new Date(o.createdDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredOkrs = filteredOkrs.filter(o =>
        o.createdDate && new Date(o.createdDate) <= new Date(endDate)
      );
    }

    const totalOkrCount = filteredOkrs.length;
    const activeOkrs = filteredOkrs.filter(o =>
      o.statusName.toLowerCase().includes("in progress")
    );
    const overallProgress = activeOkrs.length
      ? Math.round(activeOkrs.reduce((acc, o) => acc + o.progress, 0) / activeOkrs.length)
      : 0;

    const trueKrCount = parseInt(krCountResults.results.bindings[0]?.trueKrCount?.value || '0');
    const uniqueCategoryCount = new Set(filteredOkrs.map(o => o.categoryName)).size;

    // Velocity by month
    const byMonth = {};
    filteredOkrs.forEach(o => {
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

    filteredOkrs.forEach(o => {
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

    return new NextResponse(
      JSON.stringify({
        summaryMetrics: {
          totalOkrCount,
          overallProgress,
          totalKrCount: trueKrCount,
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
        },
        objectiveTimeline: filteredOkrs.map(o => ({
          id: o.id,
          title: o.title,
          hasBeginning: o.startDate,
          hasEnd: o.endDate
        }))
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err) {
    console.error("[API Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
