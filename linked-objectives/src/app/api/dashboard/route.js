import { NextResponse } from 'next/server';

const GRAPHDB_URL = process.env.GRAPHDB_URL || 'http://localhost:7200';
const REPOSITORY_ID = process.env.GRAPHDB_REPOSITORY || 'linked-objectives';

async function queryGraphDB(sparqlQuery, context = "") {
    const endpoint = `${GRAPHDB_URL}/repositories/${REPOSITORY_ID}`;
    console.log(`Executing SPARQL Query (${context}):\n>>>\n${sparqlQuery}\n<<<`);
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/sparql-query",
                Accept: "application/sparql-results+json",
            },
            body: sparqlQuery,
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`SPARQL query failed (${context}) with status:`, response.status, "Response:", errorText);
            let detailedError = errorText;
            try {
                const jsonError = JSON.parse(errorText);
                detailedError = jsonError.message || jsonError.error || errorText;
            } catch (e) {}
            throw new Error(`GraphDB query failed (${context}): ${response.status} ${response.statusText} - ${detailedError}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error connecting to GraphDB or processing query (${context}):`, error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`GraphDB connection or query processing error (${context}): ${String(error)}`);
        }
    }
}

const COMMON_PREFIXES = `
    PREFIX : <https://data.sick.com/res/dev/examples/linked-objectives-okrs/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX time: <http://www.w3.org/2006/time#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX objectives_voc: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX lifecycle_voc: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
    PREFIX orgdata: <https://data.sick.com/res/dev/examples/common-semantics/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX org: <http://www.w3.org/ns/org#>
`;

export async function GET(req) {
    try {
        // 1. Fetch Detailed OKR List
        const objectivesListQuery = `
            ${COMMON_PREFIXES}
            SELECT
                ?okr
                ?title
                (SAMPLE(COALESCE(?categoryEnLabel, STRAFTER(STR(?categoryUri), "https://data.sick.com/voc/sam/objectives-model/"))) AS ?categoryName)
                (SAMPLE(COALESCE(?statusEnLabel, STRAFTER(STR(?statusUri), "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/"))) AS ?statusName)
                ?dueDate
                (COUNT(DISTINCT ?krForCount) AS ?keyResultsCount)
                (AVG(?krProgressValue) AS ?objectiveProgress)
                ?createdDate ?modifiedDate
            WHERE {
                ?okr a objectives_voc:Objective ;
                     rdfs:label ?title .
                OPTIONAL {
                    ?okr objectives_voc:category ?categoryUri .
                    OPTIONAL { ?categoryUri skos:prefLabel ?cl . FILTER(LANGMATCHES(LANG(?cl), "en") || LANG(?cl) = "") BIND(STR(?cl) AS ?categoryEnLabel)}
                }
                OPTIONAL {
                    ?okr lifecycle_voc:state ?statusUri .
                    OPTIONAL { ?statusUri skos:prefLabel ?sl . FILTER(LANGMATCHES(LANG(?sl), "en") || LANG(?sl) = "") BIND(STR(?sl) AS ?statusEnLabel)}
                }
                OPTIONAL { ?okr dct:temporal ?intervalUri . ?intervalUri time:hasEnd ?dueDate . }
                OPTIONAL { ?okr objectives_voc:hasKeyResult ?krForCount . }
                OPTIONAL {
                    ?okr objectives_voc:hasKeyResult ?krWithProgress .
                    ?krWithProgress objectives_voc:progress ?krProgressRaw .
                    BIND(xsd:decimal(?krProgressRaw) AS ?krProgressValue)
                }
                OPTIONAL { ?okr dct:created ?createdDate . }
                OPTIONAL { ?okr dct:modified ?modifiedDate . }
            }
            GROUP BY ?okr ?title ?dueDate ?createdDate ?modifiedDate
            ORDER BY ?title
        `;
        const okrListResults = await queryGraphDB(objectivesListQuery, "OKR List");
        const userOkrs = okrListResults.results.bindings.map(b => {
            let okrProgressPercentage = 0;
            if (b.objectiveProgress?.value) {
                const decimalProgress = parseFloat(b.objectiveProgress.value);
                if (!isNaN(decimalProgress)) {
                    okrProgressPercentage = Math.round(decimalProgress * 100);
                }
            }
            return {
                id: b.okr.value.split('/').pop(),
                title: b.title?.value,
                categoryName: b.categoryName?.value || 'Uncategorized',
                statusName: b.statusName?.value || 'Unknown',
                dueDate: b.dueDate?.value,
                keyResultsCount: b.keyResultsCount ? parseInt(b.keyResultsCount.value) : 0,
                progress: okrProgressPercentage,
                createdDate: b.createdDate?.value,
                modifiedDate: b.modifiedDate?.value,
            };
        });

        // 2. Fetch Counts by Status
        const statusCountsQuery = `
            ${COMMON_PREFIXES}
            SELECT 
                ?statusName (COUNT(?okr) AS ?count)
            WHERE {
                ?okr a objectives_voc:Objective ;
                     lifecycle_voc:state ?statusUri .
                OPTIONAL {
                    ?statusUri skos:prefLabel ?sl .
                    FILTER(LANGMATCHES(LANG(?sl), "en") || LANG(?sl) = "") 
                    BIND(STR(?sl) AS ?statusEnLabel)
                }
                BIND(COALESCE(?statusEnLabel, STRAFTER(STR(?statusUri), "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/")) AS ?statusName)
            }
            GROUP BY ?statusName
            ORDER BY DESC(?count)
        `;
        const statusCountsResults = await queryGraphDB(statusCountsQuery, "Status Counts");
        const objectivesByStatus = statusCountsResults.results.bindings.map(b => ({
            name: b.statusName.value,
            value: parseInt(b.count.value)
        }));

        // 3. Fetch Counts by Category
        const categoryCountsQuery = `
            ${COMMON_PREFIXES}
            SELECT 
                ?categoryName (COUNT(?okr) AS ?count)
            WHERE {
                ?okr a objectives_voc:Objective ;
                     objectives_voc:category ?categoryUri .
                OPTIONAL {
                    ?categoryUri skos:prefLabel ?cl .
                    FILTER(LANGMATCHES(LANG(?cl), "en") || LANG(?cl) = "") 
                    BIND(STR(?cl) AS ?categoryEnLabel)
                }
                BIND(COALESCE(?categoryEnLabel, STRAFTER(STR(?categoryUri), "https://data.sick.com/voc/sam/objectives-model/")) AS ?categoryName)
            }
            GROUP BY ?categoryName
            ORDER BY DESC(?count)
        `;
        const categoryCountsResults = await queryGraphDB(categoryCountsQuery, "Category Counts");
        const objectivesByCategory = categoryCountsResults.results.bindings.map(b => ({
            name: b.categoryName.value,
            value: parseInt(b.count.value)
        }));

        // Summary metrics
        const totalOkrCount = userOkrs.length;
        const activeOkrs = userOkrs.filter(okr =>
            okr.statusName?.toLowerCase().includes('inprogress') || okr.statusName?.toLowerCase().includes('in progress')
        );
        const activeOkrCount = activeOkrs.length;
        const overallProgress = activeOkrCount > 0
            ? Math.round(activeOkrs.reduce((sum, okr) => sum + (okr.progress || 0), 0) / activeOkrCount)
            : 0;
        const totalKrCount = userOkrs.reduce((sum, okr) => sum + (okr.keyResultsCount || 0), 0);
        const uniqueCategoryCount = new Set(userOkrs.map(okr => okr.categoryName).filter(Boolean)).size;

        const progressBrackets = { "0%": 0, "1-25%": 0, "26-50%": 0, "51-75%": 0, "76-99%": 0, "100%": 0 };
        userOkrs.forEach(okr => {
            const p = okr.progress || 0;
            if (p === 0) progressBrackets["0%"]++;
            else if (p <= 25) progressBrackets["1-25%"]++;
            else if (p <= 50) progressBrackets["26-50%"]++;
            else if (p <= 75) progressBrackets["51-75%"]++;
            else if (p < 100) progressBrackets["76-99%"]++;
            else if (p === 100) progressBrackets["100%"]++;
        });
        const objectivesByProgressDistribution = Object.entries(progressBrackets)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);

        return NextResponse.json({
            userOkrs,
            summaryMetrics: {
                totalOkrCount,
                activeOkrCount,
                overallProgress,
                totalKrCount,
                uniqueCategoryCount
            },
            distributions: {
                objectivesByStatus,
                objectivesByCategory,
                objectivesByProgress: objectivesByProgressDistribution
            },
            activityFeed: [{ id: 'act-sys-1', user: 'System', action: 'Dashboard data loaded.', timestamp: new Date().toISOString() }],
            notifications: [{ id: 'notif-sys-1', text: "Welcome to your OKR Dashboard!", important: false }],
            keyResultScoresTrend: []
        });

    } catch (error) {
        console.error('Dashboard API route error:', error.message);
        return NextResponse.json(
            { error: `Failed to fetch dashboard data: ${error.message}` },
            { status: 500 }
        );
    }
}
