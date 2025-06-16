export async function GET(req, context) {
    const { id } = context.params;
    const endpoint = `http://localhost:7200/repositories/linked-objectives`;
    const companyUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;
  
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
      PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
  
      SELECT DISTINCT ?department ?departmentName ?team ?teamName ?person ?name ?email ?username ?location ?post ?roleTitle ?okr ?okrLabel ?modified ?homepage ?state

      WHERE {
        BIND(<${companyUri}> AS ?company)
        ?company a org:Organization .
        ?company org:hasUnit ?department .
        OPTIONAL { ?company foaf:homepage ?homepage . }
  
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
      }
    `;
  
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
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
  
      let homepage = null;
      for (const row of bindings) {
        if (!homepage && row.homepage?.value) {
          homepage = row.homepage.value;
        }
      }

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

        const dept = departmentsMap.get(deptId);

        const teamId = row.team?.value?.split("/").pop() || "__no_team__";
        const teamName = row.teamName?.value || dept.name || "Untitled Department Team";

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
          const okrUri = row.okr.value;
          const okrId = okrUri.split("/").pop();
          const match = okrId.match(/obj-(\d+)/);
          const objectiveNumber = match ? parseInt(match[1]) : null;

          if (!okrsMap.has(okrId)) {
            okrsMap.set(okrId, {
              id: okrId,
              label: row.okrLabel.value,
              number: objectiveNumber,
              modified: row.modified?.value || null,
              state: row.state?.value?.split("/").pop() || null,
              linkedUnits: new Set()
            });
          }

          const okr = okrsMap.get(okrId);
          const unitId = row.team?.value?.split("/").pop() || row.department?.value?.split("/").pop();
          if (unitId) {
            okr.linkedUnits.add(unitId);
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
      
      // Number of departments
      const departmentCount = departmentsMap.size;

      // Number of unique people
      const uniquePeople = new Set();
      for (const dept of departmentsMap.values()) {
        for (const team of dept.teams.values()) {
          for (const member of team.members.values()) {
            uniquePeople.add(member.id);
          }
        }
      }
      const employeeCount = uniquePeople.size;


      let latestModified = null;
      okrsMap.forEach((okr) => {
        if (okr.modified) {
          const date = new Date(okr.modified);
          if (!latestModified || date > latestModified) {
            latestModified = date;
          }
        }
      });

      return new Response(
        JSON.stringify({
          id,
          name: id.replace(/([a-z])([A-Z])/g, "$1 $2"),
          homepage,
          departments,
          okrs: Array.from(okrsMap.values()).map(okr => ({
            ...okr,
            linkedUnits: Array.from(okr.linkedUnits || []),
          })),
          stats: {
            departmentCount,
            employeeCount,
            objectiveCount: okrsMap.size,
            lastUpdated: latestModified ? latestModified.toISOString() : null
          }
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  