export async function GET() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX objv: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX lifecycle: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?obj ?title ?desc ?category ?state ?stateScheme ?kr ?krProgress ?krState ?krStateScheme ?email
    WHERE {
      ?obj rdf:type objv:Objective .

      OPTIONAL { ?obj rdfs:label ?title . }
      OPTIONAL { ?obj dct:description ?desc . }
      OPTIONAL { ?obj objv:category ?category . }

      OPTIONAL {
        ?obj lifecycle:state ?state .
        OPTIONAL { ?state skos:inScheme ?stateScheme . }
      }

      OPTIONAL {
        ?obj objv:hasKeyResult ?kr .
        OPTIONAL { ?kr objv:progress ?krProgress . }
        OPTIONAL {
          ?kr objv:state ?krState .
          OPTIONAL { ?krState skos:inScheme ?krStateScheme . }
        }
      }

      OPTIONAL {
        VALUES ?roleProp {
          responsibility:isAccountableFor
          responsibility:caresFor
          responsibility:operates
          responsibility:isConsultedFor
          responsibility:isInformedFor
        }
        ?obj ?roleProp ?post .
        ?post org:heldBy ?person .
        ?person foaf:email ?email .
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: query,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error("SPARQL query failed: " + err);
    }

    const json = await response.json();
    const results = json.results.bindings;

    const objMap = {};

    results.forEach((binding) => {
      const objId = binding.obj.value.split("/").pop();

      if (!objMap[objId]) {
        objMap[objId] = {
          id: objId,
          title: binding.title?.value || objId,
          description: binding.desc?.value || "",
          category: binding.category?.value?.split("/").pop() || null,
          state: binding.state?.value?.split("/").pop() || "Unspecified",
          stateDimension: binding.stateScheme?.value?.split("/").pop() || null,
          people: new Set(),
          keyResults: [],
        };
      }

      const email = binding.email?.value;
      if (email) {
        objMap[objId].people.add(email);
      }

      if (binding.kr && binding.krProgress) {
        const progress = parseFloat(binding.krProgress.value);
        const krState = binding.krState?.value?.split("/").pop();
        if (!["Aborted", "Withdrawn", "Rejected", "Cancelled"].includes(krState)) {
          objMap[objId].keyResults.push(progress);
        }
      }
    });

    const objectiveList = Object.values(objMap).map((obj) => {
      const avgProgress =
        obj.keyResults.length > 0
          ? obj.keyResults.reduce((a, b) => a + b, 0) / obj.keyResults.length
          : 0;

      return {
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        state: obj.state,
        stateDimension: obj.stateDimension,
        people: Array.from(obj.people),
        progress: Math.round(avgProgress),
      };
    });

    return new Response(JSON.stringify(objectiveList), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
