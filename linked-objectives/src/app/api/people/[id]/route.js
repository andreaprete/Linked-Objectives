  export async function GET(req, context) {
    const { id } = context.params;
    const personUri = `https://data.sick.com/res/dev/examples/common-semantics/${id}`;
    const endpoint = `http://localhost:7200/repositories/linked-objectives`;

    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX terms: <http://purl.org/dc/terms/>

      SELECT ?name ?email ?username ?location ?post ?roleTitle ?roleDescription ?team ?teamName ?department ?departmentName ?company 
      WHERE {
        BIND(<${personUri}> AS ?person)

        ?person a foaf:Person .

        OPTIONAL { ?person foaf:name ?name. }
        OPTIONAL { ?person foaf:email ?email. }
        OPTIONAL { ?person foaf:accountName ?username. }
        OPTIONAL { ?person vcard:hasAddress/vcard:locality ?location. }

        OPTIONAL {
          ?post org:heldBy ?person .
          OPTIONAL { ?post org:role ?roleTitle. }
          OPTIONAL { ?post terms:description ?roleDescription. }
        }

        OPTIONAL {
          ?team org:hasPost ?post .
          OPTIONAL { ?team foaf:name ?teamName. }
        }

        OPTIONAL {
          ?department org:hasUnit ?team .
          OPTIONAL { ?department foaf:name ?departmentName. }
        }

        OPTIONAL {
          ?company org:hasUnit ?department .
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
        },
        body: query,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: errorText }), {
          status: 500,
          headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store"
      },
        });
      }

      const json = await response.json();
      const binding = json.results.bindings[0];

      if (!binding) {
        return new Response(JSON.stringify({ error: "No data found" }), {
          status: 404,
          headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store"
      },
        });
      }

      const trimUri = (value) => {
        if (!value) return null;
        return value.includes("/") ? value.split("/").pop() : value;
      };

      const dataMap = {};
      let fullPostUri = null;

      Object.entries(binding).forEach(([key, val]) => {
        const value = val?.value;
        switch (key) {
          case "post":
          case "team":
          case "department":
          case "company":
            dataMap[key] = trimUri(value);
            if (key === "post") fullPostUri = value;
            break;
          case "roleDescription":
            dataMap.roleDescription = value;
            break;
          default:
            dataMap[key] = value;
            break;
        }
      });

      // Get OKRs via post
      let okrs = [];

      if (fullPostUri) {
        const okrQuery = `
          PREFIX objectives: <https://data.sick.com/voc/sam/objectives-model/>
          PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

          SELECT DISTINCT ?okr ?label ?type
          WHERE {
            ?okr a objectives:Objective ;
                rdfs:label ?label .

            {
              ?okr responsibility:isAccountableFor ?who .
              FILTER (?who IN (<${fullPostUri}>, <${personUri}>))
              BIND("isAccountableFor" AS ?type)
            } UNION {
              ?okr responsibility:caresFor ?who .
              FILTER (?who IN (<${fullPostUri}>, <${personUri}>))
              BIND("caresFor" AS ?type)
            } UNION {
              ?okr responsibility:operates ?who .
              FILTER (?who IN (<${fullPostUri}>, <${personUri}>))
              BIND("operates" AS ?type)
            }

          }
          ORDER BY ?label
        `;

        const okrResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/sparql-query",
            Accept: "application/sparql-results+json",
          },
          body: okrQuery,
        });

        if (okrResponse.ok) {
          const okrJson = await okrResponse.json();

          // For each OKR, fetch state and average progress
          okrs = await Promise.all(
            okrJson.results.bindings.map(async (row) => {
              const okrId = trimUri(row.okr.value);
              const label = row.label.value;
              const responsibility = row.type?.value || "unknown";

              let state = "Planned";
              let progress = null;

              // State
              try {
                const stateQuery = `
                  SELECT ?state WHERE {
                    OPTIONAL {
                      <https://data.sick.com/res/dev/examples/linked-objectives-okrs/${okrId}>
                        <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/state> ?state .
                    }
                  }
                `;
                const stateRes = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/sparql-query",
                    Accept: "application/sparql-results+json",
                  },
                  body: stateQuery,
                });
                if (stateRes.ok) {
                  const stateJson = await stateRes.json();
                  state =
                    (
                      stateJson.results.bindings.find((b) => b.state) || {}
                    ).state?.value
                      ?.split("/")
                      .pop() || "Planned";
                }
              } catch {}

              // Progress (avg of all KRs)
              try {
                const krProgressQuery = `
                  SELECT ?kr ?progress
                  WHERE {
                    {
                      <https://data.sick.com/res/dev/examples/linked-objectives-okrs/${okrId}>
                        <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?kr .
                    } UNION {
                      ?kr <https://data.sick.com/voc/sam/objectives-model/isKeyResultOf>
                        <https://data.sick.com/res/dev/examples/linked-objectives-okrs/${okrId}> .
                    }
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
                  const progressVals = krJson.results.bindings
                    .map((b) => parseFloat(b.progress.value))
                    .filter((v) => !isNaN(v));
                  if (progressVals.length > 0) {
                    progress =
                      progressVals.reduce((a, b) => a + b, 0) /
                      progressVals.length;
                  }
                }
              } catch {}

              return {
                id: okrId,
                title: label,
                state,
                progress: progress !== null ? Math.round(progress) : null,
                responsibility,
              };
            })
          );
        }
      }

      // ✅ Fix fallback when department is wrongly set to CommonSemantics
      if (
        dataMap.team &&
        dataMap.department === "CommonSemantics" &&
        dataMap.team !== "CommonSemantics"
      ) {
        dataMap.department = dataMap.team;
        dataMap.departmentName = dataMap.teamName;
      }

      // ✅ If still no department but has team, copy team into department
      if (dataMap.team && !dataMap.department) {
        dataMap.department = dataMap.team;
        dataMap.departmentName = dataMap.teamName;
      }

      // ✅ If no team but has department, copy department into team
      if (!dataMap.team && dataMap.department) {
        dataMap.team = dataMap.department;
        dataMap.teamName = dataMap.departmentName;
      }

      // ✅ Always ensure company exists
      if (!dataMap.company) {
        dataMap.company = "Common Semantics";
      }

      return new Response(
        JSON.stringify({
          id,
          data: dataMap,
          okrs,
        }),
        { status: 200, headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store"
      } }
      );
    } catch (err) {
      console.error("Final catch error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store"
      },
      });
    }
  }
