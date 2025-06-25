import { NextResponse } from "next/server";

export async function GET(req) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
  }

  const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name WHERE {
        ?person a foaf:Person ;
                foaf:email "${email}" ;
                foaf:name ?name .
    } LIMIT 1
  `;

  try {
    const res = await fetch("http://localhost:7200/repositories/linked-objectives", {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
        "Cache-Control": "no-store",
      },
      body: query,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`SPARQL query failed with status ${res.status}`);
    }

    const data = await res.json();

    if (data.results.bindings.length === 0) {
      return NextResponse.json({ username: null, fullname: null });
    }

    const name = data.results.bindings[0].name.value;
    const username = name.replace(/\s+/g, "");

    return NextResponse.json({
      username,         
      fullname: name, 
    });

  } catch (error) {
    console.error("Error fetching username from GraphDB:", error);
    return NextResponse.json({ error: "Failed to fetch username" }, { status: 500 });
  }
}
