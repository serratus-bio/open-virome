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

    const context = `
    You are a bioinformatician working on a project to capture and summarize bioprojects to be displayed on the page based on a set of filters.
    You will follow the below pipeline in order to summarize projects:
    1. The user will be give you a list of bioproject objects including their title, description and ID.
    2. You will need to read through the projects and gain a comprehensive understanding of all the projects through the title and project description.
    3. You should provide a succinct overview of the high-level ideas covered by the bioprojects, no longer than a paragraph.
    4. For each topic in the summarization, you should mention the relevant bioproject ID(s).
    5. You should not provide any specific details about the bioprojects, only a high-level summary.
    6. Do NOT use bioprojects that aren't given in the list.
    7. Make sure you ONLY use the information provided in the bioprojects to generate the summary.
    8. Avoid using any external information or knowledge.
    9. You may be asked to re-evaluate your answer and given hints or tips to alter your previous answer.
    `;

    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }

    const prompt = [
        {
            role: role,
            content: context,
        },
        {
            role: 'user',
            content: `Please provide a brief overview of the following bioprojects: \n ${serializedBioprojects}`,
        },
    ];
    const result = await runLLMCompletion(prompt, model);
    return result;
};
