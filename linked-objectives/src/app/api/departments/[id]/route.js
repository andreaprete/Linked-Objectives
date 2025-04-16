export async function GET(req, context) {
  const { id } = await context.params;
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

SELECT ?person ?name ?email ?username ?location ?post ?roleTitle ?team ?teamName ?department ?departmentName ?company ?okr ?okrLabel
WHERE {
  BIND(<https://data.sick.com/res/dev/examples/common-semantics/${id}> AS ?department)

  ?department foaf:name ?departmentName .
  OPTIONAL { ?company org:hasUnit ?department . }

  {
    ?department org:hasUnit ?team .
    ?team foaf:name ?teamName .
    ?team org:hasPost ?post .
  }
  UNION
  {
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

    {
      ?okr responsibility:isAccountableFor ?post
    } UNION {
      ?okr responsibility:caresFor ?post
    } UNION {
      ?okr responsibility:operates ?post
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

    const departmentName = rows[0]?.departmentName?.value || id;
    const company = rows[0]?.company?.value?.split("/").pop() || null;

    const teams = {};

    for (const row of rows) {
      const teamId = row.team?.value?.split("/").pop();
      if (!teamId) continue;

      if (!teams[teamId]) {
        teams[teamId] = {
          name: row.teamName?.value || teamId,
          members: [],
        };
      }

      const memberId = row.person?.value?.split("/").pop();
      const memberAlreadyExists = teams[teamId].members.some(
        (m) => m.id === memberId
      );

      if (!memberAlreadyExists) {
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
      }
    }

    const okrsMap = new Map();

    for (const row of rows) {
      if (row.okr && row.okrLabel) {
        const okrId = row.okr.value.split("/").pop();
        if (!okrsMap.has(okrId)) {
          okrsMap.set(okrId, {
            id: okrId,
            label: row.okrLabel.value,
          });
        }
      }
    }

    const okrs = Array.from(okrsMap.values());

    return new Response(
      JSON.stringify({
        id,
        department: departmentName,
        company,
        teams,
        okrs,
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
