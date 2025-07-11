export async function GET() {
  const endpoint = 'http://localhost:7200/repositories/linked-objectives';
  const sparqlQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>

    SELECT ?personUri ?post ?name ?roleTitle ?team ?teamName ?departmentName ?company (COUNT(DISTINCT ?okr) AS ?objectiveCount) WHERE {
      ?personUri a foaf:Person ;
                 foaf:name ?name .

      OPTIONAL {
        ?post org:heldBy ?personUri .
        OPTIONAL { ?post org:role ?roleTitle . }
        OPTIONAL {  
          ?team org:hasPost ?post .
          OPTIONAL { ?team foaf:name ?teamName . }
          OPTIONAL {
            ?department org:hasUnit ?team .
            OPTIONAL { ?department foaf:name ?departmentName . }
            OPTIONAL {
              ?company org:hasUnit ?department .
            }
          }
        }
      }

      OPTIONAL {
        {
        ?okr a objectives:Objective .
        {
          ?okr responsibility:isAccountableFor ?post
        } UNION {
          ?okr responsibility:caresFor ?post
        } UNION {
          ?okr responsibility:operates ?post
        }
        }
      }
    }
    GROUP BY ?personUri ?post ?name ?roleTitle ?team ?teamName ?departmentName ?company
    ORDER BY ?name
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
      },
      body: sparqlQuery,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const json = await response.json();
    const people = json.results.bindings
      .filter((b) => b.post && b.post.value)
      .map((b) => ({
        id: b.personUri.value.split('/').pop(),
        name: b.name?.value || "",
        role: b.roleTitle?.value || "",
        team: b.teamName?.value || "",
        teamId: b.team?.value.split('/').pop() || "",
        department: b.departmentName?.value || "",
        company: b.company?.value.split('/').pop() || "",
        objectiveCount: parseInt(b.objectiveCount.value, 10) || 0,
        postId: b.post?.value.split("/").pop() || "",
      }));

    return new Response(JSON.stringify(people), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
