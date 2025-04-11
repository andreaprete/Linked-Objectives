export async function GET(req, { params }) {
    const { id } = params;
    const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  
    const sparqlQuery = `
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  
      SELECT ?label ?comment ?description
      WHERE {
        OPTIONAL { <${objUri}> rdfs:label ?label . }
        OPTIONAL { <${objUri}> rdfs:comment ?comment . }
        OPTIONAL { <${objUri}> dct:description ?description . }
      }
    `;
  
    try {
      const response = await fetch('http://localhost:7200/repositories/linked-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          'Accept': 'application/sparql-results+json',
        },
        body: sparqlQuery,
      });
  
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'SPARQL query failed' }), { status: 500 });
      }
  
      const json = await response.json();
      const binding = json.results.bindings[0];
  
      if (!binding) {
        return new Response(JSON.stringify({ error: 'Objective not found' }), { status: 404 });
      }
  
      const result = {
        label: binding.label?.value || null,
        comment: binding.comment?.value || null,
        description: binding.description?.value || null,
        source: objUri,
      };
  
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
  