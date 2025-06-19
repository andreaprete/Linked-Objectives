export async function POST(req, context) {
  const { id } = context.params; // id of objective (e.g. 'obj-3')
  const { title, comment, description } = await req.json();

  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const endpoint = "http://localhost:7200/repositories/linked-objectives";
  const now = new Date().toISOString();

  // 1. Fetch all existing KRs for this objective
  const getKrsQuery = `
    SELECT ?kr WHERE {
      <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?kr .
    }
  `;

  let maxIndex = 0;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json"
      },
      body: getKrsQuery
    });
    const json = await res.json();
    for (const b of json.results.bindings) {
      const krUri = b.kr.value; // .../kr-3-5
      const lastSegment = krUri.split("/").pop(); // kr-3-5
      const match = lastSegment.match(/^kr-\d+-(\d+)$/);
      if (match) {
        const idx = parseInt(match[1]);
        if (idx > maxIndex) maxIndex = idx;
      }
    }
  } catch (err) {
    // ignore, assume 0 if none exist
    console.error("KR index discovery error:", err);
  }

  const objNumber = id.replace(/^obj-/, ""); // '3'
  const nextIndex = maxIndex + 1;
  const krId = `kr-${objNumber}-${nextIndex}`; // "kr-3-5"
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${krId}`;

  // 2. Insert the new KR and the relation
  const sparql = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX objectives_voc: <https://data.sick.com/voc/sam/objectives-model/>

    INSERT DATA {
      <${krUri}> rdf:type objectives_voc:KeyResult .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> "${title}" .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> "${comment || ""}" .
      <${krUri}> <http://purl.org/dc/terms/description> "${description || ""}" .
      <${krUri}> <http://purl.org/dc/terms/created> "${now}" .
      <${krUri}> <http://purl.org/dc/terms/modified> "${now}" .
      <${krUri}> objectives_voc:progress "0" .
      <${objUri}> objectives_voc:hasKeyResult <${krUri}> .
    }
  `;

  // Log your sparql for debugging
  console.log("SPARQL QUERY FOR INSERT:\n", sparql);

  const insertRes = await fetch(endpoint + "/statements", {
    method: "POST",
    headers: { "Content-Type": "application/sparql-update" },
    body: sparql,
  });

  // Try to log response text if not OK
  if (!insertRes.ok) {
    const errorText = await insertRes.text();
    console.error("SPARQL INSERT ERROR:", errorText);
    return new Response(JSON.stringify({ error: errorText }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, id: krId }), { status: 200 });
}



export async function DELETE(req, context) {
  const { id } = context.params;
  const { krIds } = await req.json();
  if (!krIds || !Array.isArray(krIds)) {
    return new Response(JSON.stringify({ error: "No krIds provided." }), { status: 400 });
  }
  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const deleteLinks = krIds.map(krId => `
    <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> <https://data.sick.com/res/dev/examples/linked-objectives-okrs/${krId}> .
    <https://data.sick.com/res/dev/examples/linked-objectives-okrs/${krId}> ?p ?o .
  `).join('\n');
  const sparql = `
    DELETE {
      ${deleteLinks}
    } WHERE {
      ${krIds.map(krId => `<https://data.sick.com/res/dev/examples/linked-objectives-okrs/${krId}> ?p ?o .`).join('\n')}
      <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?kr .
    }
  `;
  const res = await fetch("http://localhost:7200/repositories/linked-objectives/statements", {
    method: "POST",
    headers: { "Content-Type": "application/sparql-update" },
    body: sparql,
  });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: await res.text() }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
