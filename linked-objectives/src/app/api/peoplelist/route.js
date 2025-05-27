export async function GET() {
  const endpoint = 'http://localhost:7200/repositories/linked-objectives';
  const sparqlQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>

    SELECT ?personUri ?name ?roleTitle ?teamName ?departmentName (COUNT(DISTINCT ?okr) AS ?objectiveCount) WHERE {
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
          }
        }

        # Objectives for which this post is related (accountable, cares, operates)
        OPTIONAL {
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
    GROUP BY ?personUri ?name ?roleTitle ?teamName ?departmentName
    ORDER BY ?name
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
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
    const people = json.results.bindings.map((b) => ({
      id: b.personUri.value.split('/').pop(),
      name: b.name?.value || "",
      role: b.roleTitle?.value || "",
      team: b.teamName?.value || "",
      department: b.departmentName?.value || "",
      objectiveCount: parseInt(b.objectiveCount.value, 10) || 0,
    }));

    return new Response(JSON.stringify(people), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
