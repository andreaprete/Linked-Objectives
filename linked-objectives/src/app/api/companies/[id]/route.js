export async function GET(req, context) {
    const { id } = context.params;
    const endpoint = `http://localhost:7200/repositories/linked-objectives`;
    const companyUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;
  
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
      PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
  
      SELECT DISTINCT ?department ?departmentName ?team ?teamName ?person ?name ?email ?username ?location ?post ?roleTitle ?okr ?okrLabel
      WHERE {
        BIND(<${companyUri}> AS ?company)
  
        ?company org:hasUnit ?department .
        OPTIONAL { ?department foaf:name ?departmentName . }
  
        OPTIONAL {
          {
            ?department org:hasUnit ?team .
            OPTIONAL { ?team foaf:name ?teamName . }
            ?team org:hasPost ?post .
          } UNION {
            ?department org:hasPost ?post .
          }
  
          OPTIONAL {
            ?post org:role ?roleTitle ;
                  org:heldBy ?person .
  
            ?person a foaf:Person ;
                    foaf:name ?name ;
                    foaf:email ?email ;
                    foaf:accountName ?username ;
                    vcard:hasAddress/vcard:locality ?location .
          }
  
          OPTIONAL {
            ?okr a objectives:Objective ;
                 rdfs:label ?okrLabel .
  
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
        return new Response(JSON.stringify({ error: errText }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      const json = await res.json();
      const bindings = json.results.bindings;
  
      const departmentsMap = new Map();
      const okrsMap = new Map();
  
      for (const row of bindings) {
        const deptId = row.department?.value?.split("/").pop();
        if (!deptId) continue;
  
        if (!departmentsMap.has(deptId)) {
          departmentsMap.set(deptId, {
            id: deptId,
            name: row.departmentName?.value || deptId,
            teams: new Map(),
          });
        }
  
        const teamId = row.team?.value?.split("/").pop() || "__no_team__";
        const teamName = row.teamName?.value || "Department-level roles";
        const dept = departmentsMap.get(deptId);
  
        if (!dept.teams.has(teamId)) {
          dept.teams.set(teamId, {
            id: teamId === "__no_team__" ? null : teamId,
            name: teamName,
            members: new Map(),
          });
        }
  
        const personId = row.person?.value?.split("/").pop();
        if (personId) {
          const team = dept.teams.get(teamId);
          if (!team.members.has(personId)) {
            team.members.set(personId, {
              id: personId,
              name: row.name?.value,
              email: row.email?.value,
              username: row.username?.value,
              location: row.location?.value,
              post: row.post?.value?.split("/").pop(),
              roleTitle: row.roleTitle?.value,
            });
          }
        }
  
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
  
      const departments = Array.from(departmentsMap.values()).map((dept) => ({
        id: dept.id,
        name: dept.name,
        teams: Array.from(dept.teams.values()).map((team) => ({
          id: team.id,
          name: team.name,
          members: Array.from(team.members.values()),
        })),
      }));
  
      return new Response(
        JSON.stringify({
          id,
          name: id.replace(/([a-z])([A-Z])/g, "$1 $2"),
          departments,
          okrs: Array.from(okrsMap.values()),
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
  