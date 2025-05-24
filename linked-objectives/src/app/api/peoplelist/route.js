export async function GET() {
  const endpoint = 'http://localhost:7200/repositories/linked-objectives';
  const sparqlQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?personUri ?name WHERE {
      ?personUri a foaf:Person ;
                 foaf:name ?name .
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
      },
      body: sparqlQuery,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const json = await response.json();
    const people = json.results.bindings.map((b) => ({
      id: b.personUri.value.split('/').pop(),
      name: b.name.value,
    }));

    return new Response(JSON.stringify(people), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
