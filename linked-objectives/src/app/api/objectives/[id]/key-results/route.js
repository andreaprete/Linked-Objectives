import { getToken } from "next-auth/jwt";

const GRAPHDB = "http://localhost:7200/repositories/linked-objectives";
const BASE = "https://data.sick.com/res/dev/examples/linked-objectives-okrs";

async function getPeopleEmailsForObjective(id) {
  const res = await fetch(`http://localhost:3000/api/objectives/${id}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.people || [];
}

export async function POST(req, context) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id } = context.params; // obj-3
  const { title, comment, description } = await req.json();

  // Authorization
  const emails = await getPeopleEmailsForObjective(id);
  const isAllowed = token.role === "admin" || emails.includes(token.email);
  if (!isAllowed) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  // Discover next available KR index
  const objUri = `${BASE}/${id}`;
  const now = new Date().toISOString();
  const getKrsQuery = `
    SELECT ?kr WHERE {
      <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?kr .
    }
  `;
  let maxIndex = 0;
  try {
    const res = await fetch(GRAPHDB, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json"
      },
      body: getKrsQuery
    });
    const json = await res.json();
    for (const b of json.results.bindings) {
      const last = b.kr.value.split("/").pop();
      const match = last.match(/^kr-\d+-(\d+)$/);
      if (match) {
        const idx = parseInt(match[1]);
        if (idx > maxIndex) maxIndex = idx;
      }
    }
  } catch (err) {
    console.error("KR index discovery error:", err);
  }

  const objNumber = id.replace(/^obj-/, "");
  const krId = `kr-${objNumber}-${maxIndex + 1}`;
  const krUri = `${BASE}/${krId}`;
  const sparql = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX voc: <https://data.sick.com/voc/sam/objectives-model/>
    INSERT DATA {
      <${krUri}> rdf:type voc:KeyResult .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> "${title}" .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> "${comment || ""}" .
      <${krUri}> <http://purl.org/dc/terms/description> "${description || ""}" .
      <${krUri}> <http://purl.org/dc/terms/created> "${now}" .
      <${krUri}> <http://purl.org/dc/terms/modified> "${now}" .
      <${krUri}> voc:progress "0" .
      <${objUri}> voc:hasKeyResult <${krUri}> .
    }
  `;
  const insertRes = await fetch(`${GRAPHDB}/statements`, {
    method: "POST",
    headers: { "Content-Type": "application/sparql-update" },
    body: sparql,
  });

  if (!insertRes.ok) {
    const errorText = await insertRes.text();
    console.error("SPARQL INSERT ERROR:", errorText);
    return new Response(JSON.stringify({ error: errorText }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, id: krId }), { status: 200 });
}

export async function DELETE(req, context) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id } = context.params;
  const { krIds } = await req.json();

  const emails = await getPeopleEmailsForObjective(id);
  const isAllowed = token.role === "admin" || emails.includes(token.email);
  if (!isAllowed) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  if (!krIds || !Array.isArray(krIds)) {
    return new Response(JSON.stringify({ error: "No krIds provided." }), { status: 400 });
  }

  const objUri = `${BASE}/${id}`;
  const deleteLinks = krIds.map(krId => `
    <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> <${BASE}/${krId}> .
    <${BASE}/${krId}> ?p ?o .
  `).join('\n');
  const sparql = `
    DELETE {
      ${deleteLinks}
    } WHERE {
      ${krIds.map(krId => `<${BASE}/${krId}> ?p ?o .`).join('\n')}
      <${objUri}> <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?kr .
    }
  `;
  const res = await fetch(`${GRAPHDB}/statements`, {
    method: "POST",
    headers: { "Content-Type": "application/sparql-update" },
    body: sparql,
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: await res.text() }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
