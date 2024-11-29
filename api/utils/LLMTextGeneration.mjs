import { runLLMCompletion } from '../clients/oai.mjs';
import { runCypherQuery } from '../clients/neo4j.mjs';

const getBioprojectContext = async (bioprojects) => {
    const maxTotalLength = 10000;

    const bioprojectRecords = await runCypherQuery(
        `MATCH (n:BioProject)
        WHERE n.bioProject IN [${bioprojects.map((id) => `'${id}'`).join(', ')}]
        RETURN n
        ORDER BY size(n.description) DESC
        LIMIT 5000
        `,
    );

    // Try serializing full bioproject details first
    // fallback to only including titles if the total length exceeds the limit
    const serializeBioprojectRecord = (record, includeFullDetails) => {
        if (!record?.n) {
            return {};
        }
        const { bioProject: id, name, title, description } = record.n.properties;
        if (includeFullDetails) {
            return JSON.stringify({ id, name, title, description });
        }
        return JSON.stringify({ id, title });
    };

    const serializeAllBioprojects = (bioprojectRecords, includeFullDetails) => {
        let totalLength = 0;
        const serializedBioprojects = [];
        const serializedIterator = bioprojectRecords.map((record) =>
            serializeBioprojectRecord(record, includeFullDetails),
        );
        for (const serialized of serializedIterator) {
            const isExceedingMax = totalLength + serialized.length > maxTotalLength;
            if (isExceedingMax && includeFullDetails) {
                return undefined;
            }
            if (isExceedingMax) {
                break;
            }
            totalLength += serialized.length;
            serializedBioprojects.push(serialized);
        }
        return serializedBioprojects.join('\n');
    };

    let serializedBioprojects = serializeAllBioprojects(bioprojectRecords, false);
    if (serializedBioprojects === undefined) {
        serializedBioprojects = serializeAllBioprojects(bioprojectRecords, true);
    }
    return serializedBioprojects;
};

const getFilterQueryContext = (filters) => {
    const filterContext = filters.map((filter) => {
        const { filterType, filterValue } = filter;
        return `${filterType}: ${filterValue}`;
    });
    return filterContext.join('\n');
};

export const getBioprojectsSummarization = async (bioprojects) => {
    const bioprojectContext = await getBioprojectContext(bioprojects);

    const context = `
    You are a bioinformatics research assistant agent being used to summarize research projects for display on a wikipedia-like page.

    Follow the instructions to summarize BioProjects:
    1. Provide a succinct overview of the high-level ideas covered by the bioproject titles, names, and descriptions, no longer than a paragraph.
    2. For each overarching topic in the summarization, cite all relevant bioproject ID(s).
    3. DO NOT reference any bioprojects that aren't given in the list.
    4. ONLY use the information provided in the bioprojects to generate the summary.
    5. Avoid using any external information or knowledge.
    6. Use standard markdown delimiter ** to surround/highlight important topics or keywords in the bioprojects, DO NOT ADD THEM TO BIOPROJECT IDs.
    7. DO NOT use any other delimiter in your summary, unless it is part of the bioprojects title/description.

    {{Key Focus Areas}}

    {{Organisms Studied}}

    {{Research Methods and Data Types}}

    {{Geographical and Temporal Context}}

    {{Common Applications}}

    {{Notable Trends or Insights}}

    {{Conclusion}}
    `;
    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }

    const conversation = [
        {
            role: role,
            content: context,
        },
        {
            role: 'user',
            content: `Please provide a brief overview of the following bioprojects: \n ${bioprojectContext}`,
        },
    ];
    const result = await runLLMCompletion(conversation, model);
    return { text: result.text, conversation: conversation };
};

export const getMwasHypothesis = async (bioprojects, filters, selectedMetadata) => {
    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }

    const filterQueryContext = getFilterQueryContext(filters);

    const contextBioprojects = bioprojects.filter((bioproject) => bioproject !== selectedMetadata['bioproject']);
    const backgroundBioprojectContext = await getBioprojectContext(contextBioprojects);
    const targetBioprojectContext = await getBioprojectContext([selectedMetadata['bioproject']]);

    const taxSpecies = Array.from(new Set(selectedMetadata['taxSpecies'])).join(', ');
    const changeInViralLoad = selectedMetadata['mean_rpm_true'] - selectedMetadata['mean_rpm_false'];

    const target_mwas_prompt = `
        - Query: ${filterQueryContext}
        - Virus Family: ${selectedMetadata['family']}
        - Virus Species: ${taxSpecies}
        - Significant metadata term: ${selectedMetadata['metadata_field']}
        - Significant metadata value: ${selectedMetadata['metadata_value']}
        - Mean change in viral reads per million (RPM) between positive and negative samples: ${changeInViralLoad}
        - P-value: ${selectedMetadata['p_value']}
        - Fold change: ${selectedMetadata['fold_change']}
    `;

    const prompt_1 = `
    You are a bioinformatics research assistant agent being used to screen mass amounts of research data from the Sequence Read Archive to uncover promising research directions.
    You are evaluated by your ability to generate sensible, well-justified hypotheses and research directions.
    You are penalized for generating false positive hypotheses, i.e. a hypothesis that is not supported by provided reference data.

    Given the following query used to search for a virome and related background BioProject research, consider possible impactful areas of research and rationale.
    Use up-to-date knowledge in the global research literature about the virome query.

    Target Query: ${filterQueryContext}
    Background BioProjects: ${backgroundBioprojectContext}
    `;

    const prompt_2 = `
    This metadata term and value has shown significant correlation with viral load in the provided metadata terms and virus family. Compare it with impactful research areas related to the query and propose a hypothesis.

    Provide a final hypothesis that explains the correlation between a significant metadata term and viral load in the provided organism and virus family.

    Include a rationale with strong supporting evidence and possible mechanisms.

    Cite any references to BioProjects that support the hypothesis.

    Provide flaws in the hypothesis if there are any and attempt to correct them if possible. Provide possible alternative hypotheses if necessary.

    Target Metadata Association:
    ${target_mwas_prompt}

    Target BioProject:
    ${targetBioprojectContext}
    `;
    const conversation = [];
    for (const prompt of [prompt_1, prompt_2]) {
        conversation.push({
            role: role,
            content: prompt,
        });
    }
    const result = await runLLMCompletion(conversation, model);

    return { text: result.text, conversation: conversation };
};
