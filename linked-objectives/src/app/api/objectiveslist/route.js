export async function GET() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX objv: <https://data.sick.com/voc/sam/objectives-model/>

    SELECT ?obj ?label ?needs ?contributesTo ?reverseObj ?reversePred
    WHERE {
      ?obj rdf:type objv:Objective .
      OPTIONAL { ?obj rdfs:label ?label . }
      OPTIONAL { ?obj objv:needs ?needs . }
      OPTIONAL { ?obj objv:contributesTo ?contributesTo . }
      OPTIONAL {
        ?reverseObj ?reversePred ?obj .
        FILTER (?reversePred IN (objv:needs, objv:contributesTo))
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
      const err = await response.text();
      throw new Error("SPARQL query failed: " + err);
    }

    const json = await response.json();
    const objMap = {};

    json.results.bindings.forEach((binding) => {
      const id = binding.obj.value.split("/").pop();
      const label = binding.label?.value || id;

      if (!objMap[id]) {
        objMap[id] = {
          id,
          title: label,
          needs: [],
          neededBy: [],
          contributesTo: [],
          contributedToBy: [],
        };
      }

      if (binding.needs) {
        const targetId = binding.needs.value.split("/").pop();
        if (!objMap[id].needs.includes(targetId)) {
          objMap[id].needs.push(targetId);
        }
      }

      if (binding.contributesTo) {
        const targetId = binding.contributesTo.value.split("/").pop();
        if (!objMap[id].contributesTo.includes(targetId)) {
          objMap[id].contributesTo.push(targetId);
        }
      }

      if (binding.reverseObj && binding.reversePred) {
        const reverseId = binding.reverseObj.value.split("/").pop();
        const pred = binding.reversePred.value;

        if (pred.endsWith("needs")) {
          objMap[id].neededBy.push(reverseId);
        } else if (pred.endsWith("contributesTo")) {
          objMap[id].contributedToBy.push(reverseId);
        }
      }
    });

    return new Response(JSON.stringify(Object.values(objMap)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
