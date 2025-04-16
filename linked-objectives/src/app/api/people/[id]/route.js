export async function GET(req, context) {
  const { id } = await context.params;
  const personUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;
  const endpoint = `http://localhost:7200/repositories/linked-objectives`;

  const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>

    SELECT ?name ?email ?username ?location ?post ?roleTitle ?team ?teamName ?department ?departmentName ?company 
    WHERE {
      BIND(<${personUri}> AS ?person)

      ?person a foaf:Person .

      OPTIONAL { ?person foaf:name ?name. }
      OPTIONAL { ?person foaf:email ?email. }
      OPTIONAL { ?person foaf:accountName ?username. }
      OPTIONAL { ?person vcard:hasAddress/vcard:locality ?location. }

      OPTIONAL {
        ?post org:heldBy ?person .
        OPTIONAL { ?post org:role ?roleTitle. }
      }

      OPTIONAL {
        ?team org:hasPost ?post .
        OPTIONAL { ?team foaf:name ?teamName. }
      }

      OPTIONAL {
        ?department org:hasUnit ?team .
        OPTIONAL { ?department foaf:name ?departmentName. }
      }

      OPTIONAL {
        ?company org:hasUnit ?department .
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SPARQL query error:", errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const binding = json.results.bindings[0];

    if (!binding) {
      return new Response(JSON.stringify({ error: "No data found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trimUri = (value) => {
      if (!value) return null;
      return value.includes("/") ? value.split("/").pop() : value;
    };

    const dataMap = {};
    let fullPostUri = null;

    Object.entries(binding).forEach(([key, val]) => {
      const value = val?.value;
      switch (key) {
        case "post":
        case "team":
        case "department":
        case "company":
          dataMap[key] = trimUri(value);
          if (key === "post") fullPostUri = value;
          break;
        default:
          dataMap[key] = value;
          break;
      }
    });

    // Get OKRs via post
    let okrs = [];

    if (fullPostUri) {
      const okrQuery = `
        PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
        PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?okr ?label
        WHERE {
          ?okr a objectives:Objective ;
               rdfs:label ?label .

          {
            ?okr responsibility:isAccountableFor <${fullPostUri}>
          } UNION {
            ?okr responsibility:caresFor <${fullPostUri}>
          } UNION {
            ?okr responsibility:operates <${fullPostUri}>
          }
        }
        ORDER BY ?label
      `;

      const okrResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: okrQuery,
      });

      if (okrResponse.ok) {
        const okrJson = await okrResponse.json();
        okrs = okrJson.results.bindings.map((row) => ({
          id: trimUri(row.okr.value),
          label: row.label.value,
        }));
      }
    }

    if (!dataMap.company) {
      dataMap.company = dataMap.department;
      dataMap.department = dataMap.team;
      dataMap.departmentName = dataMap.teamName;
      dataMap.team = null;
      dataMap.teamName = null;
    }

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
        okrs,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Final catch error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
