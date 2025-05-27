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
          dataMap.hasFormalResponsibilityFor = dataMap.hasFormalResponsibilityFor || [];
          dataMap.hasFormalResponsibilityFor.push(object.split("/").pop());
          break;
        case "https://data.sick.com/voc/sam/objectives-model/category":
          dataMap.category = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state":
          dataMap.state = object.split("/").pop();
          break;
        case "https://data.sick.com/voc/sam/objectives-model/hasKeyResult":
          dataMap.keyResult = dataMap.keyResult || [];
          dataMap.keyResult.push(object.split("/").pop());
          break;
        default:
          break;
      }
    });

    // ---- Add this block for resolving persons ----
    const keysToResolve = ["accountableFor", "caresFor", "operates"];
    for (const key of keysToResolve) {
      const postId = dataMap[key];
      if (postId) {
        const person = await resolvePostToPerson(postId);
        if (person) {
          dataMap[key] = person;
        }
      }
    }
    // ---------------------------------------------

    // ---- Temporal interval fetching (unchanged) ----
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
    // ------------------------------------------------

    // ---- Reverse relationship fetching (unchanged) ----
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

          const alreadyContributesTo = dataMap.contributesTo?.includes(subject);
          const alreadyNeeds = dataMap.needs?.includes(subject);

          if (isNeeds && !alreadyContributesTo && !directNeeds.has(subject)) {
            dataMap.neededBy = dataMap.neededBy || [];
            if (!dataMap.neededBy.includes(subject)) {
              dataMap.neededBy.push(subject);
            }
          }

          if (
            isContributesTo &&
            !alreadyNeeds &&
            !directContributesTo.has(subject)
          ) {
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
    // ------------------------------------------------------

    // ----- NEW: Fetch average progress of all key results -----
    const krIds = dataMap.keyResult || [];
    let averageProgress = null;

    if (krIds.length > 0) {
      const krProgressQuery = `
        SELECT ?kr ?progress
        WHERE {
          VALUES ?kr { ${krIds.map(id => `<https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}>`).join(' ')} }
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
            .map(b => parseFloat(b.progress.value))
            .filter(v => !isNaN(v));
          if (progressVals.length > 0) {
            averageProgress = progressVals.reduce((a, b) => a + b, 0) / progressVals.length;
          }
        } else {
          console.error("KR progress query failed:", await krRes.text());
        }
      } catch (err) {
        console.error("Error fetching KR progress:", err);
      }
    }
    // Attach the computed average progress to the dataMap as 'progress'
    dataMap.progress = averageProgress;
    // -----------------------------------------------------------

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Final error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
