# Using Ontologies and Examples in the Data Directory

The `data` directory contains all the necessary ontologies and example datasets to work with the Linked Objectives project. This guide explains how to utilize these resources effectively.

---

## Structure of the `data` Directory

The `data` directory is organized into the following subdirectories:

1. **`model/`**: Contains the core ontologies and SHACL shapes used in the project.
   - `objectives-model.ttl`: Defines the ontology for Objectives and Key Results (OKRs).
   - `responsibility-model.ttl`: Describes roles and responsibilities within the organization.
   - `lifecycle-state-taxonomy.ttl`: Provides a taxonomy for lifecycle states.
   - `lifecycle-state-taxonomy-shacl.ttl`: Contains SHACL shapes for validating lifecycle states.

2. **`example/`**: Includes example datasets to demonstrate the usage of the ontologies.
   - `common-semantics.ttl`: A fictional organization and its staff.
   - `objectives.ttl`: Example OKRs modeled using the `objectives-model.ttl` ontology.

---

## How to Use the Ontologies

1. **Load the Ontologies**:
   - Use an RDF-compatible tool (e.g., Protégé, Apache Jena, or RDF4J) to load the `.ttl` files.
   - Ensure that the namespace prefixes are correctly resolved.

2. **Understand the Structure**:
   - Review the classes, properties, and concept schemes defined in the ontologies.
   - Use the SHACL shapes to validate your RDF data against the defined constraints.

3. **Extend the Ontologies**:
   - Add new classes or properties to the ontologies if needed.
   - Ensure that any extensions align with the existing structure and semantics.

---

## Responsibility for Ontology Changes

Changes to the ontologies should generally be avoided. If modifications are necessary, they must be made within your own namespace and under your own responsibility. However, feel free to contact us for further assistance. We are open to improving them and grateful for any feedback.

---

## How to Use the Example Datasets

1. **Load the Example Data**:
   - Import the `.ttl` files in the `example/` directory into your RDF store or tool.
   - Use the `common-semantics.ttl` file to understand the organizational structure.
   - Use the `objectives.ttl` file to explore how OKRs are modeled.

2. **Query the Data**:
   - Use SPARQL queries to explore relationships and retrieve information.
   - Example query:
     ```sparql
     SELECT ?objective ?keyResult
     WHERE {
       ?objective a <https://data.sick.com/voc/sam/objectives-model/Objective> ;
                  <https://data.sick.com/voc/sam/objectives-model/hasKeyResult> ?keyResult .
     }
     ```

3. **Validate the Data**:
   - Use the SHACL shapes in `lifecycle-state-taxonomy-shacl.ttl` to validate the lifecycle states in your data.

---

## Best Practices

- Always validate your data against the provided SHACL shapes to ensure semantic consistency.
- Use the example datasets as a reference for creating your own RDF data.
- Follow the namespace conventions and reuse existing vocabularies wherever possible.

---

For further assistance, refer to the project documentation or contact the maintainers.