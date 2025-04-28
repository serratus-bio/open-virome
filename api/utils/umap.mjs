import { runCypherQuery } from "../clients/neo4j.mjs"

const getNetworkData = async (bioprojects, palmprintOnly) => {
    const query = `
        MATCH (n:BioProject)<-[:HAS_BIOPROJECT]-(r:SRA)-[:HAS_SOTU]->(s:SOTU)
        WHERE n.bioProject IN [${bioprojects.map((bioproject) => `'${bioproject}'`).join(', ')}]
        AND n:OpenVirome AND s:OpenVirome AND r:OpenVirome
        with n.bioProject as bioProject, s.taxFamily as virusFamily, collect(DISTINCT r.bioSample) as bioSamples, collect(DISTINCT s.sotu) as sotus, collect(DISTINCT s.taxSpecies) as taxSpecies
        RETURN bioProject, virusFamily, bioSamples, sotus, taxSpecies
        LIMIT 5000
    `;

    return await runCypherQuery(query);
}
export const getUmap = async (bioprojects, filters, palmprintOnly) => {
    // need to get nodes + edges from knowledge graph
    const nodes = await getNetworkData(bioprojects, palmprintOnly);
    // console.log('nodes', nodes);

    return nodes
}
