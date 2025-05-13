export async function GET(req, context) {
  const { id } = context.params;
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;

  const sparqlQuery = `
    SELECT ?predicate ?object
    WHERE {
      <${krUri}> ?predicate ?object .
    }
  `;

  try {
    const response = await fetch(
      `http://localhost:7200/repositories/linked-objectives`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: sparqlQuery,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SPARQL error:", errorText);
      throw new Error(`GraphDB query failed: ${errorText}`);
    }

    const json = await response.json();
    const dataMap = {};

    json.results.bindings.forEach((binding) => {
      const predicate = binding.predicate.value;
      const object = binding.object.value;

      switch (predicate) {
        case "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
          dataMap.type = object;
          break;

        case "http://www.w3.org/2000/01/rdf-schema#label":
          dataMap.title = object;
          break;

        case "http://www.w3.org/2000/01/rdf-schema#comment":
          dataMap.comment = object;
          break;

        case "http://purl.org/dc/terms/description":
          dataMap.description = object;
          break;

        case "http://purl.org/dc/terms/created":
          dataMap.created = object;
          break;

        case "http://purl.org/dc/terms/modified":
          dataMap.modified = object;
          break;
        
        case "https://data.sick.com/voc/sam/objectives-model/progress":
          dataMap.progress = object;
          break;

        case "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state":
          dataMap.state = object.split('/').pop(); 
          break;

        case "http://purl.org/dc/terms/isPartOf":
          dataMap.isPartOf = dataMap.isPartOf || [];
          dataMap.isPartOf.push(object.split('/').pop()); 
          break;

        case "https://data.sick.com/voc/sam/objectives-model/isKeyResultOf":
          dataMap.isKeyResultOf = object.split('/').pop();
          break;

        default:
          break;
      }
    });

    // Fetch all lifecycle states dynamically
    const lifecycleStatesQuery = `
      PREFIX lifecycle: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT ?object
      WHERE {
        ?state skos:prefLabel ?object .
        FILTER (STRSTARTS(STR(?state), STR(lifecycle:)))
      }
    `;

    const lifecycleStatesRes = await fetch(
      'http://localhost:7200/repositories/linked-objectives',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          Accept: 'application/sparql-results+json',
        },
        body: lifecycleStatesQuery,
      }
    );

    if (!lifecycleStatesRes.ok) {
      const errorText = await lifecycleStatesRes.text();
      console.error("SPARQL error fetching lifecycle states:", errorText);
      throw new Error(`Failed to fetch lifecycle states: ${errorText}`);
    }

    const lifecycleStatesJson = await lifecycleStatesRes.json();
    const lifecycleStates = lifecycleStatesJson.results.bindings.map(binding => ({
      label: binding.object.value,
      value: binding.object.value.split('/').pop(),
    }));

    // Fetch linked objective if available
    if (dataMap.isKeyResultOf) {
      const linkedObjectiveUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${dataMap.isKeyResultOf}`;
      const linkedObjectiveQuery = `
        SELECT ?predicate ?object
        WHERE {
          <${linkedObjectiveUri}> ?predicate ?object .
        }
      `;

      const linkedRes = await fetch(`http://localhost:7200/repositories/linked-objectives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: linkedObjectiveQuery,
      });

      if (!linkedRes.ok) {
        const errorText = await linkedRes.text();
        console.error("Failed to fetch linked Objective:", errorText);
        throw new Error(`Linked Objective query failed: ${errorText}`);
      }

      const linkedJson = await linkedRes.json();
      const linkedOkrData = {};

      linkedJson.results.bindings.forEach((binding) => {
        const pred = binding.predicate.value;
        const obj = binding.object.value;

        switch (pred) {
          case "http://www.w3.org/2000/01/rdf-schema#label":
            linkedOkrData.title = obj;
            break;
          case "http://purl.org/dc/terms/description":
            linkedOkrData.description = obj;
            break;
          case "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state":
            linkedOkrData.state = obj.split("/").pop();
            break;
          case "https://data.sick.com/voc/sam/objectives-model/category":
            linkedOkrData.category = obj.split("/").pop();
            break;
          case "https://data.sick.com/voc/sam/objectives-model/progress":
            linkedOkrData.progress = parseFloat(obj); 
            break;
          default:
            break;
        }
      });

      dataMap.linkedObjective = linkedOkrData;
    }

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
        lifecycleStates, // Include lifecycle states for dropdown
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

export async function PUT(req, context) {
  const { id } = context.params;
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const body = await req.json();

  // Construct a SPARQL DELETE/INSERT query to update fields
  const sparqlUpdate = `
    DELETE {
      <${krUri}> ?p ?o .
    }
    INSERT {
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> "${body.title}" .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> "${body.comment}" .
      <${krUri}> <http://purl.org/dc/terms/description> "${body.description}" .
      <${krUri}> <https://data.sick.com/voc/sam/objectives-model/progress> "${body.progress}" .
      <${krUri}> <http://purl.org/dc/terms/modified> "${new Date().toISOString()}" .
    }
    WHERE {
      <${krUri}> ?p ?o .
      FILTER(?p IN (
        <http://www.w3.org/2000/01/rdf-schema#label>,
        <http://www.w3.org/2000/01/rdf-schema#comment>,
        <http://purl.org/dc/terms/description>,
        <https://data.sick.com/voc/sam/objectives-model/progress>,
        <http://purl.org/dc/terms/modified>
      ))
    }
  `;

  try {
    const response = await fetch(
      'http://localhost:7200/repositories/linked-objectives/statements',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-update',
        },
        body: sparqlUpdate,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed SPARQL update: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
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
