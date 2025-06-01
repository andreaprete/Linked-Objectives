export async function POST(req) {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";
  const body = await req.json();

  // 🔍 Get all existing objective IDs
  const idQuery = `
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
    SELECT ?id WHERE {
      ?o a objectives:Objective .
      BIND(REPLACE(STR(?o), "^.*[/#](obj-\\\\d+)$", "$1") AS ?id)
    }
  `;

  let newId = "obj-temp";

  try {
    const idRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: idQuery,
    });

    if (idRes.ok) {
      const json = await idRes.json();
      const existingIds = json.results.bindings
        .map((b) => b.id.value)
        .map((id) => parseInt(id.replace("obj-", ""), 10))
        .filter((n) => !isNaN(n));

      const nextNum = Math.max(...existingIds, 0) + 1;
      newId = `obj-${nextNum}`;
    }
  } catch (err) {
    console.error("Failed to fetch existing IDs:", err);
  }

  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${newId}`;
  const now = new Date().toISOString();

  const insertQuery = `
    PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX terms: <http://purl.org/dc/terms/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX lifecycle: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>

    INSERT DATA {
      <${objUri}> a objectives:Objective ;
        rdfs:label "${body.title}" ;
        rdfs:comment "${body.comment}" ;
        terms:description "${body.description}" ;
        terms:created "${now}"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
        terms:modified "${now}"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
        objectives:category <https://data.sick.com/voc/sam/objectives-model/tactical> ;
        lifecycle:state <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/Planned> .
    }
  `;

  const res = await fetch(`${endpoint}/statements`, {
    method: "POST",
    headers: { "Content-Type": "application/sparql-update" },
    body: insertQuery,
  });

  if (!res.ok) {
    const errorText = await res.text();
    return new Response(JSON.stringify({ error: errorText }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, id: newId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
