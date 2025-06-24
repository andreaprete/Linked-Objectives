export async function GET(req, context) {
  const { id } = context.params;
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const endpoint = `http://localhost:7200/repositories/linked-objectives`;

  async function resolvePostToPerson(postId) {
    const postUri = `https://data.sick.com/res/dev/examples/common-semantics/${postId}`;
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      SELECT ?person ?name ?roleTitle WHERE {
        <${postUri}> org:heldBy ?person ;
                     org:role ?roleTitle .
        ?person foaf:name ?name .
      }
    `;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: query,
      });
      if (!res.ok) return null;
      const json = await res.json();
      const row = json.results.bindings[0];
      if (!row) return null;

      return {
        id: row.person.value.split("/").pop(),
        name: row.name.value,
        role: row.roleTitle.value,
      };
    } catch (err) {
      console.error("Error resolving post to person:", err);
      return null;
    }
  }

  async function resolvePersonDirectly(personId) {
    const personUri = `https://data.sick.com/res/dev/examples/common-semantics/${personId}`;
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      SELECT ?name ?roleTitle WHERE {
        OPTIONAL { <${personUri}> foaf:name ?name . }
        OPTIONAL {
          ?post org:heldBy <${personUri}> ;
                org:role ?roleTitle .
        }
      } LIMIT 1
    `;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: query,
      });
      if (!res.ok) return null;
      const json = await res.json();
      const row = json.results.bindings[0];
      return {
        id: personId,
        name: row?.name?.value || personId,
        role: row?.roleTitle?.value || null,
      };
    } catch (err) {
      console.error("Error resolving person directly with role:", err);
      return { id: personId, name: personId, role: null };
    }
  }

  try {
    const query = `
      SELECT ?predicate ?object WHERE {
        <${krUri}> ?predicate ?object .
      }
    `;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: query,
    });
    if (!res.ok) throw new Error("SPARQL fetch failed");

    const json = await res.json();
    const dataMap = {};

    json.results.bindings.forEach(({ predicate, object }) => {
      const pred = predicate.value;
      const obj = object.value;
      if (pred.endsWith("label")) dataMap.title = obj;
      else if (pred.endsWith("comment")) dataMap.comment = obj;
      else if (pred.endsWith("description")) dataMap.description = obj;
      else if (pred.endsWith("created")) dataMap.created = obj;
      else if (pred.endsWith("modified")) dataMap.modified = obj;
      else if (pred.endsWith("progress")) dataMap.progress = parseFloat(obj);
      else if (pred.endsWith("isKeyResultOf")) dataMap.isKeyResultOf = obj.split("/").pop();
      else if (pred.endsWith("state")) dataMap.state = obj.split("/").pop();
    });

    const parentId = dataMap.isKeyResultOf;
    const parentUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${parentId}`;
    const parentQuery = `
      SELECT ?predicate ?object WHERE {
        <${parentUri}> ?predicate ?object .
      }
    `;

    const parentRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: parentQuery,
    });

    const parentData = await parentRes.json();
    const linkedObjective = {};
    let rolesToResolve = {};
    const krIds = [];

    parentData.results.bindings.forEach(({ predicate, object }) => {
      const pred = predicate.value;
      const obj = object.value;
      if (pred.endsWith("label")) linkedObjective.title = obj;
      else if (pred.endsWith("description")) linkedObjective.description = obj;
      else if (pred.endsWith("category")) linkedObjective.category = obj.split("/").pop();
      else if (pred.endsWith("state")) linkedObjective.state = obj.split("/").pop();
      else if (pred.endsWith("hasKeyResult")) krIds.push(obj.split("/").pop());
      else if (pred.endsWith("isAccountableFor")) rolesToResolve.accountableFor = obj.split("/").pop();
      else if (pred.endsWith("caresFor")) rolesToResolve.caresFor = obj.split("/").pop();
      else if (pred.endsWith("operates")) rolesToResolve.operates = obj.split("/").pop();
    });

    for (const [role, id] of Object.entries(rolesToResolve)) {
      let resolved = await resolvePostToPerson(id);
      if (!resolved) resolved = await resolvePersonDirectly(id);
      if (resolved) linkedObjective[role] = resolved;
    }

    if (krIds.length > 0) {
      const krProgressQuery = `
        SELECT ?kr ?progress WHERE {
          VALUES ?kr { ${krIds.map(id => `<https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}>`).join(" ")} }
          ?kr <https://data.sick.com/voc/sam/objectives-model/progress> ?progress .
        }
      `;
      const krRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: krProgressQuery,
      });
      if (krRes.ok) {
        const krJson = await krRes.json();
        const progressVals = krJson.results.bindings.map(b => parseFloat(b.progress.value)).filter(v => !isNaN(v));
        if (progressVals.length > 0) {
          linkedObjective.averageProgress = progressVals.reduce((a, b) => a + b, 0) / progressVals.length;
        }
      }
    }

    dataMap.linkedObjective = linkedObjective;

    return new Response(JSON.stringify({ id, data: dataMap }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Key Result GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}

export async function PUT(req, context) {
  const { id } = context.params;
  const krUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const body = await req.json();

  const insertStatements = [];
  if (body.title !== undefined)
    insertStatements.push(`<${krUri}> <http://www.w3.org/2000/01/rdf-schema#label> """${body.title}""" .`);
  if (body.comment !== undefined)
    insertStatements.push(`<${krUri}> <http://www.w3.org/2000/01/rdf-schema#comment> """${body.comment}""" .`);
  if (body.description !== undefined)
    insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/description> """${body.description}""" .`);
  if (body.progress !== undefined)
    insertStatements.push(`<${krUri}> <https://data.sick.com/voc/sam/objectives-model/progress> "${body.progress}"^^xsd:decimal .`);
  if (body.state !== undefined)
    insertStatements.push(`<${krUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> """${body.state}""" .`);
  if (body.created !== undefined)
    insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/created> "${body.created}" .`);
  insertStatements.push(`<${krUri}> <http://purl.org/dc/terms/modified> "${new Date().toISOString()}" .`);

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
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
