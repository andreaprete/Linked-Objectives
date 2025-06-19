export async function GET(req, context) {
  const { id } = context.params;
  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const endpoint = `http://localhost:7200/repositories/linked-objectives`;

  const sparqlQuery = `
    SELECT ?predicate ?object
    WHERE {
      <${objUri}> ?predicate ?object .
    }
  `;

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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: sparqlQuery,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphDB query failed: ${errorText}`);
    }

    const json = await response.json();
    const dataMap = {};

    json.results.bindings.forEach((binding) => {
      const predicate = binding.predicate.value;
      const object = binding.object.value;

      switch (predicate) {
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
        case "http://www.w3.org/2002/07/owl#versionInfo":
          dataMap.version = object;
          break;
        case "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
          dataMap.type = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/responsibility-model/isAccountableFor":
          dataMap.accountableFor = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/responsibility-model/caresFor":
          dataMap.caresFor = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/responsibility-model/operates":
          dataMap.operates = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/objectives-model/contributesTo":
          dataMap.contributesTo = dataMap.contributesTo || [];
          dataMap.contributesTo.push(object.split("/").pop());
          break;
        case "https://data.sick.com/voc/sam/objectives-model/needs":
          dataMap.needs = dataMap.needs || [];
          dataMap.needs.push(object.split("/").pop());
          break;
        case "http://purl.org/dc/terms/temporal":
          dataMap.temporal = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/responsibility-model/hasFormalResponsibilityFor":
          dataMap.hasFormalResponsibilityFor =
            dataMap.hasFormalResponsibilityFor || [];
          dataMap.hasFormalResponsibilityFor.push(object.split("/").pop());
          break;
        case "https://data.sick.com/voc/sam/objectives-model/category":
          dataMap.category = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state":
          dataMap.state = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/responsibility-model/hasResponsibilityFor":
          dataMap.hasResponsibilityFor = dataMap.hasResponsibilityFor || [];
          dataMap.hasResponsibilityFor.push(object.split("/").pop());
          break;
        case "https://data.sick.com/voc/sam/objectives-model/hasKeyResult":
          dataMap.keyResult = dataMap.keyResult || [];
          dataMap.keyResult.push(object.split("/").pop());
          break;
        default:
          break;
      }
    });

    // Resolve responsibility values
    const keysToResolve = ["accountableFor", "caresFor", "operates"];
    for (const key of keysToResolve) {
      const id = dataMap[key];
      if (!id) continue;

      // Try resolving as a post → person first
      let resolved = await resolvePostToPerson(id);

      // Fallback: maybe it's a direct person URI
      if (!resolved) {
        resolved = await resolvePersonDirectly(id);
      }

      if (resolved) {
        dataMap[key] = resolved;
      }
    }

    // Temporal handling
    if (dataMap.temporal) {
      const intervalUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${dataMap.temporal}`;
      const temporalQuery = `
        PREFIX time: <http://www.w3.org/2006/time#>
        SELECT ?predicate ?object WHERE {
          <${intervalUri}> ?predicate ?object .
        }
      `;

      function formatDate(dateStr) {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date);
      }

      try {
        const temporalRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/sparql-query",
            Accept: "application/sparql-results+json",
          },
          body: temporalQuery,
        });

        if (temporalRes.ok) {
          const temporalJson = await temporalRes.json();
          const temporalBindings = temporalJson.results.bindings;

          const temporalData = {};
          for (const b of temporalBindings) {
            const pred = b.predicate.value;
            const obj = b.object.value.replace(/^"|"(\^\^.+)?$/g, "");

            if (pred === "http://www.w3.org/2006/time#hasBeginning") {
              temporalData.start = formatDate(obj);
            } else if (pred === "http://www.w3.org/2006/time#hasEnd") {
              temporalData.end = formatDate(obj);
            }
          }

          dataMap.temporal = temporalData;
        }
      } catch (err) {
        console.error("Error fetching temporal interval:", err);
      }
    }

    // Reverse relations
    const reverseQuery = `
      SELECT ?subject ?predicate WHERE {
        ?subject ?predicate <${objUri}> .
        FILTER (?predicate IN (
          <https://data.sick.com/voc/sam/objectives-model/contributesTo>,
          <https://data.sick.com/voc/sam/objectives-model/needs>
        ))
      }
    `;

    try {
      const reverseRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: reverseQuery,
      });

      if (reverseRes.ok) {
        const reverseJson = await reverseRes.json();
        const directNeeds = new Set(dataMap.needs || []);
        const directContributesTo = new Set(dataMap.contributesTo || []);

        reverseJson.results.bindings.forEach((binding) => {
          const subject = binding.subject.value.split("/").pop();
          const pred = binding.predicate.value;

          const isContributesTo =
            pred ===
            "https://data.sick.com/voc/sam/objectives-model/contributesTo";
          const isNeeds =
            pred === "https://data.sick.com/voc/sam/objectives-model/needs";

          if (isNeeds && !directNeeds.has(subject)) {
            dataMap.neededBy = dataMap.neededBy || [];
            if (!dataMap.neededBy.includes(subject)) {
              dataMap.neededBy.push(subject);
            }
          }

          if (isContributesTo && !directContributesTo.has(subject)) {
            dataMap.contributedToBy = dataMap.contributedToBy || [];
            if (!dataMap.contributedToBy.includes(subject)) {
              dataMap.contributedToBy.push(subject);
            }
          }
        });
      }
    } catch (err) {
      console.error("Error fetching reverse relationships:", err);
    }

    // Average progress of key results
    const krIds = dataMap.keyResult || [];
    let averageProgress = null;

    if (krIds.length > 0) {
      const krProgressQuery = `
        SELECT ?kr ?progress
        WHERE {
          VALUES ?kr { ${krIds
            .map(
              (id) =>
                `<https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}>`
            )
            .join(" ")} }
          ?kr <https://data.sick.com/voc/sam/objectives-model/progress> ?progress .
        }
      `;
      try {
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
          const progressVals = krJson.results.bindings
            .map((b) => parseFloat(b.progress.value))
            .filter((v) => !isNaN(v));
          if (progressVals.length > 0) {
            averageProgress =
              progressVals.reduce((a, b) => a + b, 0) / progressVals.length;
          }
        } else {
          console.error("KR progress query failed:", await krRes.text());
        }
      } catch (err) {
        console.error("Error fetching KR progress:", err);
      }
    }

    dataMap.progress = averageProgress;

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Final error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  }
}

export async function PUT(req, context) {
  const { id } = context.params;
  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;
  const body = await req.json();
  const now = new Date().toISOString();

  const insertLines = [];
  const deleteLines = [];

  // Safe triple: skip empty strings
  const triple = (s, p, o) => {
    if (typeof o === "string" && o.trim() === "") return null;
    return `${s} ${p} ${o} .`;
  };

  // TITLE
  if (body.title !== undefined) {
    deleteLines.push(
      `<${objUri}> <http://www.w3.org/2000/01/rdf-schema#label> ?label .`
    );
    const t = triple(
      `<${objUri}>`,
      `<http://www.w3.org/2000/01/rdf-schema#label>`,
      `"${body.title}"`
    );
    if (t) insertLines.push(t);
  }

  // COMMENT
  if (body.comment !== undefined) {
    deleteLines.push(
      `<${objUri}> <http://www.w3.org/2000/01/rdf-schema#comment> ?comment .`
    );
    const t = triple(
      `<${objUri}>`,
      `<http://www.w3.org/2000/01/rdf-schema#comment>`,
      `"${body.comment}"`
    );
    if (t) insertLines.push(t);
  }

  // DESCRIPTION
  if (body.description !== undefined) {
    deleteLines.push(
      `<${objUri}> <http://purl.org/dc/terms/description> ?desc .`
    );
    const t = triple(
      `<${objUri}>`,
      `<http://purl.org/dc/terms/description>`,
      `"${body.description}"`
    );
    if (t) insertLines.push(t);
  }

  // PROGRESS
  if (body.progress !== undefined) {
    deleteLines.push(
      `<${objUri}> <https://data.sick.com/voc/sam/objectives-model/progress> ?progress .`
    );
    const t = triple(
      `<${objUri}>`,
      `<https://data.sick.com/voc/sam/objectives-model/progress>`,
      `"${body.progress}"`
    );
    if (t) insertLines.push(t);
  }

  // CATEGORY
  if (body.type !== undefined) {
    deleteLines.push(
      `<${objUri}> <https://data.sick.com/voc/sam/objectives-model/category> ?category .`
    );
    const t = triple(
      `<${objUri}>`,
      `<https://data.sick.com/voc/sam/objectives-model/category>`,
      `<https://data.sick.com/voc/sam/objectives-model/${body.type}>`
    );
    if (t) insertLines.push(t);
  }

  // STATE
  if (body.state !== undefined) {
    deleteLines.push(
      `<${objUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?state .`
    );

    const t = triple(
      `<${objUri}>`,
      `<https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state>`,
      `<https://data.sick.com/voc/dev/lifecycle-state-taxonomy/${body.state}>`
    );
    if (t) insertLines.push(t);
  }

  // CREATED DATE
  if (body.created) {
    deleteLines.push(
      `<${objUri}> <http://purl.org/dc/terms/created> ?created .`
    );
    const t = triple(
      `<${objUri}>`,
      `<http://purl.org/dc/terms/created>`,
      `"${body.created}"`
    );
    if (t) insertLines.push(t);
  }

  // MODIFIED DATE (always update)
  insertLines.push(
    triple(
      `<${objUri}>`,
      `<http://purl.org/dc/terms/modified>`,
      `"${now}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
    )
  );

  // TEMPORAL
  if (body.temporal?.start || body.temporal?.end) {
    const temporalUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}-interval`;
    deleteLines.push(`<${objUri}> <http://purl.org/dc/terms/temporal> ?temp .`);
    deleteLines.push(`<${temporalUri}> ?tp ?to .`);

    insertLines.push(
      triple(
        `<${objUri}>`,
        `<http://purl.org/dc/terms/temporal>`,
        `<${temporalUri}>`
      )
    );
    insertLines.push(
      triple(`<${temporalUri}>`, `a`, `<http://www.w3.org/2006/time#Interval>`)
    );

    if (body.temporal.start) {
      const t = triple(
        `<${temporalUri}>`,
        `<http://www.w3.org/2006/time#hasBeginning>`,
        `"${body.temporal.start}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
      );
      if (t) insertLines.push(t);
    }

    if (body.temporal.end) {
      const t = triple(
        `<${temporalUri}>`,
        `<http://www.w3.org/2006/time#hasEnd>`,
        `"${body.temporal.end}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`
      );
      if (t) insertLines.push(t);
    }
  }

  // RESPONSIBILITY RELATIONSHIPS (using POST URI, not person)
  const roles = {
    accountableFor: "isAccountableFor",
    caresFor: "caresFor",
    operates: "operates",
  };

  for (const [field, pred] of Object.entries(roles)) {
    if (body[field]?.id) {
      const postUri = `https://data.sick.com/res/dev/examples/common-semantics/${body[field].id}`;
      deleteLines.push(
        `<${objUri}> <https://data.sick.com/voc/sam/responsibility-model/${pred}> ?oldPost .`
      );

      insertLines.push(
        `<${objUri}> <https://data.sick.com/voc/sam/responsibility-model/${pred}> <${postUri}> .`
      );
    }
  }

  // RELATED OKRs
  if (Array.isArray(body.relatedOKRs)) {
    deleteLines.push(
      `<${objUri}> <https://data.sick.com/voc/sam/objectives-model/needs> ?o .`
    );
    deleteLines.push(
      `<${objUri}> <https://data.sick.com/voc/sam/objectives-model/contributesTo> ?o .`
    );
    deleteLines.push(
      `?x <https://data.sick.com/voc/sam/objectives-model/needs> <${objUri}> .`
    );
    deleteLines.push(
      `?x <https://data.sick.com/voc/sam/objectives-model/contributesTo> <${objUri}> .`
    );

    for (const rel of body.relatedOKRs) {
      const targetUri = `<https://data.sick.com/res/dev/examples/linked-objectives-okrs/${rel.id}>`;
      if (rel.relation === "needs" || rel.relation === "contributesTo") {
        insertLines.push(
          `<${objUri}> <https://data.sick.com/voc/sam/objectives-model/${rel.relation}> ${targetUri} .`
        );
      } else if (rel.relation === "neededBy") {
        insertLines.push(
          `${targetUri} <https://data.sick.com/voc/sam/objectives-model/needs> <${objUri}> .`
        );
      } else if (rel.relation === "contributedToBy") {
        insertLines.push(
          `${targetUri} <https://data.sick.com/voc/sam/objectives-model/contributesTo> <${objUri}> .`
        );
      }
    }
  }

  // Safely build query
  const safeInsert =
    insertLines.length > 0 ? insertLines.join("\n") : "# nothing to insert";
  const safeDelete =
    deleteLines.length > 0 ? deleteLines.join("\n") : "# nothing to delete";

  const updateQuery = `
    DELETE {
      ${safeDelete}
    }
    INSERT {
      ${safeInsert}
    }
    WHERE {
      OPTIONAL { <${objUri}> <http://www.w3.org/2000/01/rdf-schema#label> ?label . }
      OPTIONAL { <${objUri}> <http://www.w3.org/2000/01/rdf-schema#comment> ?comment . }
      OPTIONAL { <${objUri}> <http://purl.org/dc/terms/description> ?desc . }
      OPTIONAL { <${objUri}> <https://data.sick.com/voc/sam/objectives-model/progress> ?progress . }
      OPTIONAL { <${objUri}> <https://data.sick.com/voc/sam/objectives-model/category> ?category . }
      OPTIONAL { <${objUri}> <http://purl.org/dc/terms/created> ?created . }
      OPTIONAL { <${objUri}> <http://purl.org/dc/terms/temporal> ?temp . }
      OPTIONAL { <${objUri}-interval> ?tp ?to . }
      OPTIONAL { <${objUri}> <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?state . }
      OPTIONAL { ?oldPost ?rolePred <${objUri}> . }
      OPTIONAL { <${objUri}> <https://data.sick.com/voc/sam/objectives-model/needs> ?o . }
      OPTIONAL { <${objUri}> <https://data.sick.com/voc/sam/objectives-model/contributesTo> ?o . }
      OPTIONAL { ?x <https://data.sick.com/voc/sam/objectives-model/needs> <${objUri}> . }
      OPTIONAL { ?x <https://data.sick.com/voc/sam/objectives-model/contributesTo> <${objUri}> . }
    }

  `;

  // 🔍 Log query for debugging
  console.log("SPARQL UPDATE QUERY:\n", updateQuery);

  try {
    const res = await fetch(
      "http://localhost:7200/repositories/linked-objectives/statements",
      {
        method: "POST",
        headers: { "Content-Type": "application/sparql-update" },
        body: updateQuery,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`SPARQL update failed: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PUT error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  }
}
