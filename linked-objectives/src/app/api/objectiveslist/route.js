import { requireLogin } from "@/lib/auth/requireLogin";

export async function getObjectiveList() {
  const endpoint = "http://localhost:7200/repositories/linked-objectives";

  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX objv: <https://data.sick.com/voc/sam/objectives-model/>
    PREFIX responsibility: <https://data.sick.com/voc/sam/responsibility-model/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX lifecycle: <https://data.sick.com/voc/dev/lifecycle-state-taxonomy/>
    PREFIX org: <http://www.w3.org/ns/org#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?obj ?title ?desc ?category ?state ?stateScheme ?kr ?krProgress ?krState ?krStateScheme ?email
           ?needs ?contributesTo ?reverseObj ?reversePred
    WHERE {
      ?obj rdf:type objv:Objective .

      OPTIONAL { ?obj rdfs:label ?title . }
      OPTIONAL { ?obj dct:description ?desc . }
      OPTIONAL { ?obj objv:category ?category . }

      OPTIONAL {
        ?obj lifecycle:state ?state .
        OPTIONAL { ?state skos:inScheme ?stateScheme . }
      }

      OPTIONAL {
        ?obj objv:hasKeyResult ?kr .
        OPTIONAL { ?kr objv:progress ?krProgress . }
        OPTIONAL {
          ?kr objv:state ?krState .
          OPTIONAL { ?krState skos:inScheme ?krStateScheme . }
        }
      }

      OPTIONAL {
        VALUES ?roleProp {
          responsibility:isAccountableFor
          responsibility:caresFor
          responsibility:operates
          responsibility:isConsultedFor
          responsibility:isInformedFor
        }
        ?obj ?roleProp ?post .
        ?post org:heldBy ?person .
        ?person foaf:email ?email .
      }

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
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json",
      },
      body: query,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("SPARQL query failed: " + (await res.text()));
    const data = await res.json();

    const objMap = {};

    data.results.bindings.forEach((b) => {
      const id = b.obj.value.split("/").pop();

      if (!objMap[id]) {
        objMap[id] = {
          id,
          title: b.title?.value || id,
          description: b.desc?.value || "",
          category: b.category?.value?.split("/").pop() || null,
          state: b.state?.value?.split("/").pop() || "Unspecified",
          stateDimension: b.stateScheme?.value?.split("/").pop() || null,
          people: new Set(),
          keyResults: [],
          needs: [],
          neededBy: [],
          contributesTo: [],
          contributedToBy: [],
        };
      }

      const obj = objMap[id];

      if (b.email?.value) obj.people.add(b.email.value);

      if (b.kr?.value && b.krProgress?.value) {
        const krState = b.krState?.value?.split("/").pop();
        if (!["Aborted", "Withdrawn", "Rejected", "Cancelled"].includes(krState)) {
          obj.keyResults.push(parseFloat(b.krProgress.value));
        }
      }

      if (b.needs?.value) {
        const targetId = b.needs.value.split("/").pop();
        if (!obj.needs.includes(targetId)) obj.needs.push(targetId);
      }

      if (b.contributesTo?.value) {
        const targetId = b.contributesTo.value.split("/").pop();
        if (!obj.contributesTo.includes(targetId)) obj.contributesTo.push(targetId);
      }

      if (b.reverseObj?.value && b.reversePred?.value) {
        const reverseId = b.reverseObj.value.split("/").pop();
        const pred = b.reversePred.value;

        if (pred.endsWith("needs") && !obj.neededBy.includes(reverseId)) {
          obj.neededBy.push(reverseId);
        } else if (pred.endsWith("contributesTo") && !obj.contributedToBy.includes(reverseId)) {
          obj.contributedToBy.push(reverseId);
        }
      }
    });

    const result = Object.values(objMap).map((o) => {
      const avg = o.keyResults.length ? o.keyResults.reduce((a, b) => a + b, 0) / o.keyResults.length : 0;

      return {
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        state: o.state,
        stateDimension: o.stateDimension,
        people: Array.from(o.people),
        progress: Math.round(avg),
        needs: o.needs,
        neededBy: o.neededBy,
        contributesTo: o.contributesTo,
        contributedToBy: o.contributedToBy,
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Objective GET failed:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = requireLogin(getObjectiveList);