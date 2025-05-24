export async function GET(req, context) {
  const { id } = context.params;
  const endpoint = `http://localhost:7200/repositories/linked-objectives`;
  const deptUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;

  const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>

    SELECT DISTINCT ?person ?name ?email ?username ?location ?post ?roleTitle ?team ?teamName ?department ?departmentName ?company ?okr ?okrLabel ?modified ?state
    WHERE {
      BIND(<${deptUri}> AS ?department)

      ?department a org:OrganizationalUnit .
      FILTER NOT EXISTS { ?department a org:Organization }

      ?department foaf:name ?departmentName .
      OPTIONAL { ?company org:hasUnit ?department . }

      {
        ?department org:hasUnit ?team .
        ?team foaf:name ?teamName .
        ?team org:hasPost ?post .
      }
      UNION {
        ?department org:hasPost ?post .
        BIND(?department AS ?team)
      }

      ?post org:role ?roleTitle ;
            org:heldBy ?person .

      ?person a foaf:Person ;
              foaf:name ?name ;
              foaf:email ?email ;
              foaf:accountName ?username ;
              vcard:hasAddress/vcard:locality ?location .

      OPTIONAL {
        ?okr a objectives:Objective ;
             rdfs:label ?okrLabel .
        OPTIONAL { ?okr dct:modified ?modified . }
        OPTIONAL { ?okr <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?state . }

        {
          ?okr responsibility:isAccountableFor ?post
        } UNION {
          ?okr responsibility:caresFor ?post
        } UNION {
          ?okr responsibility:operates ?post
        } UNION {
          ?okr responsibility:isAccountableFor ?person
        } UNION {
          ?okr responsibility:caresFor ?person
        } UNION {
          ?okr responsibility:operates ?person
        }
      }
    }
    ORDER BY ?team ?person
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: query,
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const rows = json.results.bindings;

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data found for the given department ID" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const departmentName = rows[0]?.departmentName?.value || id;
    const company = rows[0]?.company?.value?.split("/").pop() || null;

    const teams = {};
    const uniquePeople = new Set();

    for (const row of rows) {
      const teamId = row.team?.value?.split("/").pop();
      if (!teamId) continue;

      if (!teams[teamId]) {
        teams[teamId] = {
          id: teamId,
          name: row.teamName?.value || teamId,
          members: [],
        };
      }

      const memberId = row.person?.value?.split("/").pop();
      if (!teams[teamId].members.some((m) => m.id === memberId)) {
        const member = {
          id: memberId,
          name: row.name?.value,
          email: row.email?.value,
          username: row.username?.value,
          location: row.location?.value,
          post: row.post?.value?.split("/").pop(),
          roleTitle: row.roleTitle?.value,
        };
        teams[teamId].members.push(member);
        uniquePeople.add(memberId);
      }
    }

    const okrsMap = new Map();
    let latestModified = null;

    for (const row of rows) {
      if (row.okr && row.okrLabel) {
        const okrUri = row.okr.value;
        const okrId = okrUri.split("/").pop();
        const match = okrId.match(/obj-(\\d+)/);
        const objectiveNumber = match ? parseInt(match[1]) : null;

        if (!okrsMap.has(okrId)) {
          okrsMap.set(okrId, {
            id: okrId,
            label: row.okrLabel.value,
            number: objectiveNumber,
            modified: row.modified?.value || null,
            state: row.state?.value?.split("/").pop() || null,
          });
        }

        if (row.modified?.value) {
          const modifiedDate = new Date(row.modified.value);
          if (!latestModified || modifiedDate > latestModified) {
            latestModified = modifiedDate;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        id,
        department: departmentName,
        company,
        teams,
        okrs: Array.from(okrsMap.values()),
        stats: {
          employeeCount: uniquePeople.size,
          objectiveCount: okrsMap.size,
          lastUpdated: latestModified ? latestModified.toISOString() : null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
