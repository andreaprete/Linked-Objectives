// File: /app/api/objectiveslist/route.js

export async function GET() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>

    SELECT ?obj ?label
    WHERE {
      ?obj rdf:type objectives:Objective .
      OPTIONAL { ?obj rdfs:label ?label . }
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

    const objectives = json.results.bindings.map((binding) => ({
      id: binding.obj.value.split("/").pop(), // extract ID from full URI
      title: binding.label ? binding.label.value : binding.obj.value, // fallback to URI if no label
    }));

    return new Response(JSON.stringify(objectives), {
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
