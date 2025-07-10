export async function GET() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX objv: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX dc: <http://purl.org/dc/terms/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX state: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>

    SELECT ?obj ?label ?comment ?description ?created ?modified ?version ?progress ?category ?state
           ?kr ?needs ?contributesTo ?reverseObj ?reversePred
    WHERE {
      ?obj rdf:type objv:Objective .
      OPTIONAL { ?obj rdfs:label ?label . }
      OPTIONAL { ?obj rdfs:comment ?comment . }
      OPTIONAL { ?obj dc:description ?description . }
      OPTIONAL { ?obj dc:created ?created . }
      OPTIONAL { ?obj dc:modified ?modified . }
      OPTIONAL { ?obj owl:versionInfo ?version . }
      OPTIONAL { ?obj objv:progress ?progress . }
      OPTIONAL { ?obj objv:category ?category . }
      OPTIONAL { ?obj state:state ?state . }
      OPTIONAL { ?obj objv:hasKeyResult ?kr . }
      OPTIONAL { ?obj objv:needs ?needs . }
      OPTIONAL { ?obj objv:contributesTo ?contributesTo . }
      OPTIONAL {
        ?reverseObj ?reversePred ?obj .
        FILTER (?reversePred IN (objv:needs, objv:contributesTo))
      }
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

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("SPARQL query failed: " + errorText);
    }

    const json = await res.json();
    const objMap = {};

    json.results.bindings.forEach((b) => {
      const id = b.obj.value.split("/").pop();
      if (!objMap[id]) {
        objMap[id] = {
          id,
          title: b.label?.value || id,
          description: b.description?.value || "",
          comment: b.comment?.value || "",
          created: b.created?.value || null,
          modified: b.modified?.value || null,
          version: b.version?.value || null,
          progress: b.progress ? parseFloat(b.progress.value) : null,
          category: b.category?.value.split("/").pop() || null,
          state: b.state?.value.split("/").pop() || null,
          keyResults: [],
          needs: [],
          contributesTo: [],
          contributedToBy: [],
          neededBy: [],
        };
      }

      const pushIfNew = (arr, uri) => {
        const val = uri?.value?.split("/").pop();
        if (val && !arr.includes(val)) arr.push(val);
      };

      pushIfNew(objMap[id].keyResults, b.kr);
      pushIfNew(objMap[id].needs, b.needs);
      pushIfNew(objMap[id].contributesTo, b.contributesTo);

      if (b.reverseObj && b.reversePred) {
        const reverseId = b.reverseObj.value.split("/").pop();
        const pred = b.reversePred.value;

        if (pred.endsWith("needs")) {
          pushIfNew(objMap[id].neededBy, b.reverseObj);
        } else if (pred.endsWith("contributesTo")) {
          pushIfNew(objMap[id].contributedToBy, b.reverseObj);
        }
      }
    });

    return new Response(JSON.stringify(Object.values(objMap)), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Failed to load enriched objective list:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
