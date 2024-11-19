import { runLLMCompletion } from '../clients/oai.mjs';
import { runCypherQuery } from '../clients/neo4j.mjs';

export const getBioprojectsSummarization = async (bioprojects) => {
    const bioprojectRecords = await runCypherQuery(
        `MATCH (n:BioProject)
        WHERE n.bioProject IN [${bioprojects.map((id) => `'${id}'`).join(', ')}]
        RETURN n
        ORDER BY size(n.description) DESC
        LIMIT 20
        `,
    );

    const serializeBioProjectRecord = (record) => {
        if (!record?.n) {
            return {};
        }
        const { bioProject: id, name, title, description } = record.n.properties;
        return JSON.stringify({ id, name, title, description });
    };
    const maxTotalLength = 10000;
    const serializedBioprojects = [];
    let totalLength = 0;
    for (const serialized of bioprojectRecords.map(serializeBioProjectRecord)) {
        if (totalLength + serialized.length > maxTotalLength) {
            break;
        }
        serializedBioprojects.push(serialized);
        totalLength += serialized.length;
    }

    const context = `
    You are a bioinformatician working on a project to capture and summarize bioprojects to be displayed on a wikipedia-like page.
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
    10. You should use the delimiter | to surround/highlight important topics or keywords in the bioprojects, DO NOT ADD THEM TO BIOPROJECT IDs.
    11. Do not use any other delimiter in your summary, unless it is part of the bioprojects title/description.
    12. You should loosely follow the provided template as a baseline for your summary where data is applicable, however you should prioritize maintaining a coherent paragraph. DO NOT EXPLICITLY STATE THE TEMPLATE IN YOUR RESPONSE:
    Key Focus Areas:
    [A summary of the primary research topics or objectives represented across the bioprojects. For example, "Most bioprojects focus on genetic diversity in avian species, pathogen-host interactions, and vaccine development for parasitic diseases like Eimeria."]

    Organism Coverage:
    [List the main organisms or taxa studied across the projects, highlighting the most frequently studied ones. For example, "Studies predominantly involve species from the genus Eimeria, with additional focus on avian hosts like chickens and turkeys."]

    Research Methods and Data Types:
    [Summarize common methodologies or data types used, such as genome sequencing, transcriptomics, metagenomics, etc. For example, "Whole-genome sequencing and transcriptomic analyses are the most frequently utilized methods, often accompanied by phylogenetic studies."]

    Geographical and Temporal Context:
    [Highlight any trends in the geographical locations or timeframes of data collection. For example, "Most studies originate from poultry farms in North America and Europe, with a few focusing on emerging markets in Asia."]

    Common Applications:
    [Describe the overarching applications or implications of the research. For example, "The findings aim to improve disease control, enhance vaccine development, and increase agricultural productivity."]

    Notable Trends or Insights:
    [Highlight patterns, gaps, or emerging areas of interest. For example, "There is a growing focus on antimicrobial resistance in parasitic infections and the role of environmental factors in disease outbreaks."]

    Conclusion:
    [Provide a high-level insight into what the bioprojects collectively reveal about the overarching research domain. For example, "The bioprojects collectively emphasize the urgent need for sustainable solutions to tackle parasitic infections in livestock, with a strong focus on leveraging genomic data for targeted interventions."]
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
