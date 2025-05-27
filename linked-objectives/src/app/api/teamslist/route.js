export async function GET() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>

    SELECT DISTINCT ?team ?teamName ?member ?department ?departmentName ?company ?companyName ?okr ?okrLabel
    WHERE {
      ?team a org:OrganizationalUnit ;
            foaf:name ?teamName .

      OPTIONAL { ?team org:hasPost/org:heldBy ?member. }

      OPTIONAL {
        ?department org:hasUnit ?team ;
                   foaf:name ?departmentName .
        OPTIONAL {
          ?company org:hasUnit ?department ;
                   foaf:name ?companyName .
        }
      }

      OPTIONAL {
        ?team org:hasPost ?post .
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
      throw new Error("SPARQL query failed: " + errText);
    }

    const json = await res.json();
    const bindings = json.results.bindings;

    const teams = {};
    const departmentIdsWithSubteams = new Set();

    for (const row of bindings) {
      const teamUri = row.team.value;
      const teamId = teamUri.split("/").pop();
      const teamName = row.teamName.value;

      if (!teams[teamId]) {
        let departmentId = row.department?.value?.split("/").pop() || null;
        let departmentName = row.departmentName?.value || null;
        let companyId = row.company?.value?.split("/").pop() || null;
        let companyName = row.companyName?.value || null;

        // Fallback logic
        if (!companyId && departmentId === "CommonSemantics") {
          companyId = "CommonSemantics";
          companyName = "Common Semantics";
          departmentId = teamId;
          departmentName = teamName;
        }

        teams[teamId] = {
          id: teamId,
          name: teamName,
          memberCount: 0,
          department: departmentName,
          departmentId,
          company: companyName,
          companyId,
          okrSet: new Set(),
          okrSample: new Set(),
          members: new Set(),
        };
      }

      if (row.department?.value) {
        const deptId = row.department.value.split("/").pop();
        departmentIdsWithSubteams.add(deptId);
      }

      if (row.member?.value) {
        teams[teamId].members.add(row.member.value);
      }

      if (row.okr?.value) {
        const okrId = row.okr.value.split("/").pop();
        const okrTitle = row.okrLabel?.value || okrId;
        teams[teamId].okrSet.add(okrId);
        if (teams[teamId].okrSample.size < 3) {
          teams[teamId].okrSample.add(okrTitle);
        }
      }
    }

    const result = Object.values(teams)
      .filter((team) => !departmentIdsWithSubteams.has(team.id))
      .map((team) => ({
        id: team.id,
        name: team.name,
        memberCount: team.members.size,
        department: team.department,
        departmentId: team.departmentId,
        company: team.company,
        companyId: team.companyId,
        okrCount: team.okrSet.size,
        okrSample: Array.from(team.okrSample),
      }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
