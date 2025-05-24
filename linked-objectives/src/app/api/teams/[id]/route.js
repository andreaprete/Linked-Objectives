export async function GET(req, context) {
    const { id } = await context.params;
    const endpoint = `http://localhost:7200/repositories/linked-objectives`;
    const teamUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;
  
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
      PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
  
      SELECT ?person ?name ?email ?username ?location ?post ?roleTitle ?teamName ?department ?departmentName ?company ?okr ?okrLabel
      WHERE {
        BIND(<${teamUri}> AS ?team)
  
        ?team foaf:name ?teamName .
        OPTIONAL {
          ?department org:hasUnit ?team ;
                     foaf:name ?departmentName .
        }
        OPTIONAL {
          ?company org:hasUnit ?department .
        }
  
        ?team org:hasPost ?post .
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
            ?okr responsibility:operatesFor ?post
          } UNION {
            ?okr responsibility:isAccountableFor ?person
          } UNION {
            ?okr responsibility:caresFor ?person
          } UNION {
            ?okr responsibility:operatesFor ?person
          }
        }
      }
      ORDER BY ?person
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
  
      const teamName = rows[0]?.teamName?.value || id;
      let department = rows[0]?.department?.value?.split("/").pop() || null;
      let departmentName = rows[0]?.departmentName?.value || null;
      let company = rows[0]?.company?.value?.split("/").pop() || null;
  
      if (!company && department === "CommonSemantics") {
        company = "CommonSemantics";
        department = teamUri.split("/").pop();
        departmentName = teamName;
      }
  
      const members = [];
      const okrsMap = new Map();
      const seenPeople = new Set();
  
      for (const row of rows) {
        const personId = row.person?.value?.split("/").pop();
        if (!seenPeople.has(personId)) {
          seenPeople.add(personId);
          members.push({
            id: personId,
            name: row.name?.value,
            email: row.email?.value,
            username: row.username?.value,
            location: row.location?.value,
            post: row.post?.value?.split("/").pop(),
            roleTitle: row.roleTitle?.value,
          });
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
  
      const okrs = Array.from(okrsMap.values());
  
      return new Response(
        JSON.stringify({
          id,
          team: teamName,
          department,
          departmentName,
          company,
          members,
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
  