import { NextResponse } from 'next/server';

const GRAPHDB_URL = process.env.GRAPHDB_URL || 'http://localhost:7200';
const REPOSITORY_ID = process.env.GRAPHDB_REPOSITORY || 'linked-objectives';

async function queryGraphDB(sparqlQuery, context = "") {
  const endpoint = `${GRAPHDB_URL}/repositories/${REPOSITORY_ID}`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: sparqlQuery,
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (err) {
    console.error(`[GraphDB ERROR - ${context}]:`, err);
    throw new Error(`SPARQL failed (${context}): ${err.message}`);
  }
}

const PREFIXES = `
  PREFIX : <https://data.sick.com/res/dev/examples/linked-objectives-okrs/>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX time: <http://www.w3.org/2006/time#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX objectives_voc: <https://data.sick.com/voc/sam/objectives-model/>
  PREFIX lifecycle_voc: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
  PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
`;

export async function GET() {
  try {
    // 1. Query Objectives with metadata
    const query = `
      ${PREFIXES}
      SELECT ?okr ?title ?dueDate ?createdDate ?modifiedDate
             (SAMPLE(?categoryEnLabel) AS ?categoryName)
             (SAMPLE(?statusEnLabel) AS ?statusName)
             (COUNT(DISTINCT ?kr) AS ?keyResultsCount)
             (AVG(xsd:decimal(?progressVal)) AS ?objectiveProgress)
      WHERE {
        ?okr a objectives_voc:Objective ; rdfs:label ?title .
        OPTIONAL { ?okr objectives_voc:category/skos:prefLabel ?categoryEnLabel . FILTER(LANG(?categoryEnLabel) = "en") }
        OPTIONAL { ?okr lifecycle_voc:state/skos:prefLabel ?statusEnLabel . FILTER(LANG(?statusEnLabel) = "en") }
        OPTIONAL { ?okr dct:temporal/time:hasEnd ?dueDate . }
        OPTIONAL { ?okr objectives_voc:hasKeyResult ?kr . }
        OPTIONAL { ?okr objectives_voc:hasKeyResult/objectives_voc:progress ?progressVal . }
        OPTIONAL { ?okr dct:created ?createdDate . }
        OPTIONAL { ?okr dct:modified ?modifiedDate . }
        OPTIONAL { ?okr :riskScore ?riskScore . }
        OPTIONAL { ?okr :priority ?priority . }
        OPTIONAL { ?okr responsibility:hasResponsible/rdfs:label ?ownerName . }

      }
      GROUP BY ?okr ?title ?dueDate ?createdDate ?modifiedDate
    `;
    const result = await queryGraphDB(query, "OKRs");
    const bindings = result.results.bindings;

    const userOkrs = bindings.map(b => {
      const progress = b.objectiveProgress?.value
        ? Math.round(parseFloat(b.objectiveProgress.value) * 100)
        : 0;
      return {
        id: b.okr.value.split("/").pop(),
        title: b.title?.value,
        categoryName: b.categoryName?.value || "Uncategorized",
        statusName: b.statusName?.value || "Unknown",
        riskScore: b.riskScore?.value || "UNKNOWN",
        priority: b.priority?.value || "LOW",
        owner: b.ownerName?.value || "Unassigned",

        dueDate: b.dueDate?.value,
        createdDate: b.createdDate?.value,
        modifiedDate: b.modifiedDate?.value,
        keyResultsCount: parseInt(b.keyResultsCount?.value || '0'),
        progress
      };
    });

    // 2. Summary metrics
    const totalOkrCount = userOkrs.length;
    const activeOkrs = userOkrs.filter(o =>
      o.statusName?.toLowerCase().includes("in progress") ||
      o.statusName?.toLowerCase().includes("inprogress")
    );
    const activeOkrCount = activeOkrs.length;
    const overallProgress = activeOkrCount
      ? Math.round(activeOkrs.reduce((acc, o) => acc + o.progress, 0) / activeOkrs.length)
      : 0;
    const totalKrCount = userOkrs.reduce((acc, o) => acc + o.keyResultsCount, 0);
    const uniqueCategoryCount = new Set(userOkrs.map(o => o.categoryName)).size;

    // 3. Top Objectives (by due date)
    const topObjectives = [...userOkrs]
      .filter(o => !!o.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // 4. Upcoming Deadlines (next 30 days)
    const now = new Date();
    const upcomingDeadlines = userOkrs.filter(o => {
      const due = new Date(o.dueDate);
      return due > now && due <= new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    });

    // 5. High Risk
    const overdue = userOkrs.filter(o => {
      const due = new Date(o.dueDate);
      return o.progress === 0 && due < now;
    });
    const stale = userOkrs.filter(o => {
      const mod = new Date(o.modifiedDate);
      return (now - mod) / (1000 * 60 * 60 * 24) > 30;
    });

    // 6. Velocity per month
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

    // 7. Distributions
    const statusMap = {};
    const categoryMap = {};
    const progressMap = { "0%": 0, "1-25%": 0, "26-50%": 0, "51-75%": 0, "76-99%": 0, "100%": 0 };

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

    const objectivesByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    const objectivesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    const objectivesByProgress = Object.entries(progressMap)
      .map(([name, value]) => ({ name, value }))
      .filter(entry => entry.value > 0);

    return NextResponse.json({
      summaryMetrics: {
        totalOkrCount,
        activeOkrCount,
        overallProgress,
        totalKrCount,
        uniqueCategoryCount
      },
      topObjectives,
      upcomingDeadlines,
      highRisk: { overdue, stale },
      objectiveVelocity,
      distributions: {
        objectivesByStatus,
        objectivesByCategory,
        objectivesByProgress
      },
      keyResultScoresTrend: [] // placeholder
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
