import { runCypherQuery } from "../clients/neo4j.mjs";

const getUMAP = async (req, res) => {
    query_local = `
    // For local context (filtered subset)
    MATCH (sotu:SOTU)
    WHERE $filterCondition // This will be replaced with actual filter conditions
    // Get relationships between SOTUs
    MATCH (sotu)-[:HAS_INFERRED_TAXON]->(taxon:Taxon)
    OPTIONAL MATCH (sotu)-[:SEQUENCE_ALIGNMENT]-(other:SOTU)
    // Get SRA and host information
    OPTIONAL MATCH (sra:SRA)-[:HAS_SOTU]->(sotu)
    OPTIONAL MATCH (sra)-[:HAS_HOST_METADATA]->(host:Taxon)
    OPTIONAL MATCH (sra)-[:HAS_BIOPROJECT]->(bioproject:BioProject)
    // Community information (assuming community_id is stored as a property)
    RETURN 
        sotu.sotu as id,
        sotu.community_id as community,
        COLLECT(DISTINCT taxon.scientificName) as taxonomies,
        taxon.tax_family as family,
        COUNT(DISTINCT other) as connections,
        COUNT(DISTINCT sra) as runs,
        COLLECT(DISTINCT host.scientificName) as hosts,
        COLLECT(DISTINCT bioproject.bioProject) as bioprojects
    ORDER BY connections DESC
    LIMIT 1000;`

    query_global = `
    // For global context (entire hypervirome)
    // This query focuses on community-level data
    MATCH (sotu:SOTU)
    WITH sotu.community_id as community, COUNT(sotu) as sotu_count
    WHERE community IS NOT NULL
    MATCH (s:SOTU {community_id: community})
    MATCH (s)-[:HAS_INFERRED_TAXON]->(t:Taxon)
    OPTIONAL MATCH (s)-[:SEQUENCE_ALIGNMENT]-(other:SOTU)
    WHERE other.community_id <> community
    WITH 
        community, 
        sotu_count,
        COUNT(DISTINCT other.community_id) as external_connections,
        COLLECT(DISTINCT t.tax_family) as families
    RETURN 
        community as id,
        sotu_count as size,
        external_connections as connections,
        families
    ORDER BY size DESC;
    `

    query_global_test = `
    MATCH (sotu:SOTU)
    WITH sotu.community_id as community, COUNT(sotu) as sotu_count
    WHERE community IS NOT NULL
    WITH community, sotu_count
    ORDER BY sotu_count DESC
    LIMIT 20  // Adjust this number based on your needs
    MATCH (s:SOTU {community_id: community})
    MATCH (s)-[:HAS_INFERRED_TAXON]->(t:Taxon)
    OPTIONAL MATCH (s)-[:SEQUENCE_ALIGNMENT]-(other:SOTU)
    WHERE other.community_id <> community
    WITH community, sotu_count, COUNT(DISTINCT other.community_id) as external_connections, COLLECT(DISTINCT t.tax_family) as families
    RETURN community as id, sotu_count as size, external_connections as connections, families
    ORDER BY size DESC;
    `

    


}