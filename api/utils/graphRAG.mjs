import { runLLMCompletion } from '../clients/oai.mjs';
import { runCypherQuery } from '../clients/neo4j.mjs';

export const getBioprojectsSummarization = async (bioprojects) => {
    const serializeBioProjectRecord = (record) => {
        if (!record || !record?.n) {
            return {};
        }
        const node = record.n;
        return JSON.stringify({
            id: node.properties.bioProject,
            name: node.properties.name,
            title: node.properties.title,
            description: node.properties.description,
        });
    };
    const bioprojectRecords = await runCypherQuery(
        `MATCH (n:BioProject)
        WHERE n.bioProject IN [${bioprojects.map((id) => `'${id}'`).join(', ')}]
        RETURN n
        ORDER BY size(n.description) DESC
        LIMIT 10
        `,
    );
    const serializedBioprojects = bioprojectRecords.map(serializeBioProjectRecord);
    const prompt = [
        {
            role: 'user',
            content: `Please provide a brief integrated summarization of the following BioProjects: \n ${serializedBioprojects}`,
        },
    ];
    const result = await runLLMCompletion(prompt);
    return result;
};
