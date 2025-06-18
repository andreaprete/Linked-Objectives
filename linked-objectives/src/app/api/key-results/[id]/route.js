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

    // Log the raw response body as text (just to make sure the connection is live)
    const cloned = response.clone();
    const rawText = await cloned.text();

    // Parse the original response as JSON
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
            // This is the only tricky part
            if (!dataMap.extra) dataMap.extra = [];
            dataMap.extra.push({ predicate, object });
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

    // Fetch linked objective info, and average progress of its KRs
    if (dataMap.isKeyResultOf) {
      const objectiveId = dataMap.isKeyResultOf;
      const linkedObjectiveUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${objectiveId}`;
      const linkedObjectiveQuery = `
        SELECT ?predicate ?object
        WHERE {
          <${linkedObjectiveUri}> ?predicate ?object .
        }
      `;

      // 1. Fetch Objective info
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

      // 2. Fetch all KRs for this Objective and calculate average progress
      const allKRsQuery = `
        SELECT ?kr ?progress
        WHERE {
          ?kr <https://data.sick.com/voc/sam/objectives-model/isKeyResultOf> <${linkedObjectiveUri}> .
          ?kr <https://data.sick.com/voc/sam/objectives-model/progress> ?progress .
        }
      `;

      const allKRsRes = await fetch(`http://localhost:7200/repositories/linked-objectives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: allKRsQuery,
      });

      if (!allKRsRes.ok) {
        const errorText = await allKRsRes.text();
        console.error("Failed to fetch all KRs:", errorText);
        throw new Error(`Key Result progress query failed: ${errorText}`);
      }

      const allKRsJson = await allKRsRes.json();
      const krProgressValues = allKRsJson.results.bindings.map(binding => parseFloat(binding.progress.value)).filter(v => !isNaN(v));

      // Calculate average progress
      let averageProgress = null;
      if (krProgressValues.length > 0) {
        averageProgress = krProgressValues.reduce((a, b) => a + b, 0) / krProgressValues.length;
      }
      linkedOkrData.averageProgress = averageProgress;

      dataMap.linkedObjective = linkedOkrData;
    }

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
        lifecycleStates,
      }),
      { status: 200, headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    } }
    );
  } catch (err) {
    console.error("Error in GET handler:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
    });
  }
}

// (Your PUT handler stays unchanged)
export async function PUT(req, context) {
  const { id } = context.params;
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const body = await req.json();

  // Build INSERT for all fields, even if unchanged (for atomic update)
  const insertStatements = [];
  if (body.title !== undefined)
    insertStatements.push(`<${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> """${body.title}""" .`);
  if (body.comment !== undefined)
    insertStatements.push(`<${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> """${body.comment}""" .`);
  if (body.description !== undefined)
    insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/description> """${body.description}""" .`);
  if (body.progress !== undefined)
    insertStatements.push(`<${krUri}> <https://data.sick.com/voc/sam/objectives-model/progress> "${body.progress}" .`);
  if (body.state !== undefined)
    insertStatements.push(`<${krUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> """${body.state}""" .`);
  if (body.created !== undefined)
    insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/created> "${body.created}" .`);
  // Always update 'modified' to now
  insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/modified> "${new Date().toISOString()}" .`);

  // Use per-field DELETE-INSERT-WHERE pattern
  const sparqlUpdate = `
    DELETE {
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> ?oldLabel .
      <${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> ?oldComment .
      <${krUri}> <http://purl.org/dc/terms/description> ?oldDescription .
      <${krUri}> <https://data.sick.com/voc/sam/objectives-model/progress> ?oldProgress .
      <${krUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?oldState .
      <${krUri}> <http://purl.org/dc/terms/created> ?oldCreated .
      <${krUri}> <http://purl.org/dc/terms/modified> ?oldModified .
    }
    INSERT {
      ${insertStatements.join('\n')}
    }
    WHERE {
      OPTIONAL { <${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> ?oldLabel . }
      OPTIONAL { <${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> ?oldComment . }
      OPTIONAL { <${krUri}> <http://purl.org/dc/terms/description> ?oldDescription . }
      OPTIONAL { <${krUri}> <https://data.sick.com/voc/sam/objectives-model/progress> ?oldProgress . }
      OPTIONAL { <${krUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?oldState . }
      OPTIONAL { <${krUri}> <http://purl.org/dc/terms/created> ?oldCreated . }
      OPTIONAL { <${krUri}> <http://purl.org/dc/terms/modified> ?oldModified . }
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
      headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store" 
    },
    });
  }
}
