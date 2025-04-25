export async function GET(req, context) {
  const { id } = context.params;
  const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;

  const sparqlQuery = `
    SELECT ?predicate ?object
    WHERE {
      <${objUri}> ?predicate ?object .
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
          dataMap.isKeyResultOf = dataMap.isKeyResultOf || [];
          dataMap.isKeyResultOf.push(object.split('/').pop()); 
          break;

        default:
          break;
      }
    });

    return new Response(
      JSON.stringify({
        id,
        data: dataMap,
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

// CODE TO GET EVERYHTING

// export async function GET(req, { params }) {
//   const { id } = params;
//   const objUri = `https://data.sick.com/res/dev/examples/linked-objectives-okrs/${id}`;

//   const sparqlQuery = `
//     SELECT ?predicate ?object
//     WHERE {
//       <${objUri}> ?predicate ?object .
//     }
//   `;

//   try {
//     const response = await fetch(
//       `http://localhost:7200/repositories/linked-objectives`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/sparql-query",
//           Accept: "application/sparql-results+json",
//         },
//         body: sparqlQuery,
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("SPARQL error:", errorText);
//       throw new Error(`GraphDB query failed: ${errorText}`);
//     }

//     const json = await response.json();
//     const dataMap = {};

//     json.results.bindings.forEach((binding) => {
//       const predicate = binding.predicate.value;
//       const object = binding.object.value;

//       // Allow multiple values for the same predicate
//       if (dataMap[predicate]) {
//         // Convert to array if not already
//         if (!Array.isArray(dataMap[predicate])) {
//           dataMap[predicate] = [dataMap[predicate]];
//         }
//         dataMap[predicate].push(object);
//       } else {
//         dataMap[predicate] = object;
//       }
//     });

//     return new Response(
//       JSON.stringify({
//         id,
//         data: dataMap,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }