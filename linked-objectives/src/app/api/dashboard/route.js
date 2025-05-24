// src/app/api/dashboard/route.js
import { NextResponse } from 'next/server';

// Your GraphDB endpoint - consider moving to environment variables
const GRAPHDB_URL = process.env.GRAPHDB_URL || 'http://localhost:7200';
const REPOSITORY_ID = process.env.GRAPHDB_REPOSITORY || 'linked-objectives';

async function queryGraphDB(sparqlQuery) {
    const endpoint = `${GRAPHDB_URL}/repositories/${REPOSITORY_ID}`;
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
            console.error("SPARQL query failed with status:", response.status, "Response:", errorText);
            throw new Error(`GraphDB query failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error connecting to GraphDB or processing query:", error);
        throw new Error(`GraphDB connection or query processing error: ${error.message}`);
    }
}

export async function GET(req) {
    try {
        const objectivesSparqlQuery = `
            PREFIX : <https://data.sick.com/res/dev/examples/linked-objectives-okrs/>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX time: <http://www.w3.org/2006/time#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
            PREFIX lifecycle: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
            PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
            PREFIX orgdata: <https://data.sick.com/res/dev/examples/common-semantics/>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            PREFIX org: <http://www.w3.org/ns/org#>

            SELECT
                ?okr
                ?title
                ?description
                ?comment
                (SAMPLE(COALESCE(?categoryEnLabel, STRAFTER(STR(?categoryUri), STR(objectives:)))) AS ?categoryName)
                (SAMPLE(COALESCE(?statusEnLabel, STRAFTER(STR(?statusUri), STR(lifecycle:)))) AS ?statusName)
                ?version
                ?createdDate
                ?modifiedDate
                (SAMPLE(?accountablePersonName) AS ?accountableForName)
                (SAMPLE(?caresForPersonName) AS ?caresForName)
                (SAMPLE(?operatesPersonName) AS ?operatesName)
                ?dueDate
                (COUNT(DISTINCT ?kr) AS ?keyResultsCount)
                (AVG(xsd:decimal(STR(?krProgress))) AS ?objectiveProgress)


            WHERE {
                ?okr a objectives:Objective .
                ?okr rdfs:label ?title .

                OPTIONAL { ?okr dct:description ?description . }
                OPTIONAL { ?okr rdfs:comment ?comment . }
                OPTIONAL {
                    ?okr objectives:category ?categoryUri .
                    OPTIONAL { 
                        ?categoryUri skos:prefLabel ?categoryLangLabel .
                        FILTER(LANGMATCHES(LANG(?categoryLangLabel), "en") || LANG(?categoryLangLabel) = "")
                        BIND(STR(?categoryLangLabel) AS ?categoryEnLabel)
                    }
                }
                OPTIONAL {
                    ?okr lifecycle:state ?statusUri .
                     OPTIONAL {
                        ?statusUri skos:prefLabel ?statusLangLabel .
                        FILTER(LANGMATCHES(LANG(?statusLangLabel), "en") || LANG(?statusLangLabel) = "")
                        BIND(STR(?statusLangLabel) AS ?statusEnLabel)
                    }
                }
                OPTIONAL { ?okr owl:versionInfo ?version . }
                OPTIONAL { ?okr dct:created ?createdDate . }
                OPTIONAL { ?okr dct:modified ?modifiedDate . }
                OPTIONAL {
                    ?okr dct:temporal ?intervalUri .
                    ?intervalUri time:hasEnd ?dueDate .
                }
                OPTIONAL {
                    ?okr responsibility:isAccountableFor ?accountablePostUri .
                    ?accountablePostUri org:heldBy ?accountablePerson .
                    ?accountablePerson foaf:name ?accountablePersonName .
                }
                OPTIONAL {
                    ?okr responsibility:caresFor ?caresPostUri .
                    ?caresPostUri org:heldBy ?caresPerson .
                    ?caresPerson foaf:name ?caresForPersonName .
                }
                OPTIONAL {
                    ?okr responsibility:operates ?operatesPostUri .
                    ?operatesPostUri org:heldBy ?operatesPerson .
                    ?operatesPerson foaf:name ?operatesPersonName .
                }
                
                OPTIONAL {
                    ?okr objectives:hasKeyResult ?kr .
                    ?kr a objectives:KeyResult .
                    OPTIONAL { ?kr objectives:progress ?krProgress . }
                }
            }
            GROUP BY ?okr ?title ?description ?comment ?version ?createdDate ?modifiedDate ?dueDate
            ORDER BY ?title
        `;
        
        const sparqlResults = await queryGraphDB(objectivesSparqlQuery);

        const userOkrs = sparqlResults.results.bindings.map(b => ({
            id: b.okr.value.split('/').pop(),
            title: b.title?.value,
            description: b.description?.value,
            comment: b.comment?.value,
            status: b.statusName?.value || 'N/A',
            category: b.categoryName?.value || 'N/A',
            progress: b.objectiveProgress ? parseFloat(b.objectiveProgress.value) * 100 : 0, // Convert 0.0-1.0 to 0-100
            keyResultsCount: b.keyResultsCount ? parseInt(b.keyResultsCount.value) : 0,
            dueDate: b.dueDate?.value,
            version: b.version?.value,
            createdDate: b.createdDate?.value,
            modifiedDate: b.modifiedDate?.value,
            accountableFor: b.accountableForName?.value,
            caresFor: b.caresForName?.value,
            operates: b.operatesName?.value,
        }));

        // For Activity Feed, Notifications, Progress Chart Data - use mock data for now
        // as the RDF model doesn't directly support them yet in a complex way.
        const MOCK_ACTIVITY_FEED = [ /* ...your mock data... */ ];
        const MOCK_DASHBOARD_NOTIFICATIONS = [ /* ...your mock data... */ ];
        const MOCK_PROGRESS_DATA = [ /* ...your mock data... */ ];


        return NextResponse.json({
            userOkrs,
            activityFeed: MOCK_ACTIVITY_FEED, // Replace with real data when available
            notifications: MOCK_DASHBOARD_NOTIFICATIONS, // Replace
            progressData: MOCK_PROGRESS_DATA, // Replace
        });

    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ error: `Failed to fetch dashboard data: ${error.message}` }, { status: 500 });
    }
}