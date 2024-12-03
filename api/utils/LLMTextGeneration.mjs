import { runLLMCompletion } from '../clients/oai.mjs';
import { runCypherQuery } from '../clients/neo4j.mjs';
import {
    getMwasHypothesisSystemPrompt,
    getBioProjectsSummarizationPrompt,
    getGraphRAGMapSystemPrompt,
    getGraphRAGReduceSystemPrompt,
    allowGeneralKnowledgeSystemPrompt,
    noDataFoundMessage,
} from './prompts.mjs';

const INCLUDE_MWAS_IN_GRAPH_RAG = true;

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
    const context = getBioProjectsSummarizationPrompt();
    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }

    let conversation = [
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

    conversation.push({
        role: role,
        content: result.text,
    });

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

    const instructionsPrompt = `
    ${getMwasHypothesisSystemPrompt(filterQueryContext, backgroundBioprojectContext)}

    ${allowGeneralKnowledgeSystemPrompt()}
    `;

    const documentsPrompt = `
    <documents>
    Target Metadata Association:
    ${target_mwas_prompt}

    Target BioProject:
    ${targetBioprojectContext}
    </documents>
    `;
    let conversation = [
        {
            role: role,
            content: instructionsPrompt,
        },
        {
            role: 'user',
            content: documentsPrompt,
        },
    ];
    const result = await runLLMCompletion(conversation, model);

    conversation.push({
        role: role,
        content: result.text,
    });

    return { text: result.text, conversation: conversation };
};

export const getGraphRAGResults = async (message, conversation = []) => {
    let communitySummaries;
    try {
        communitySummaries = await import('./virome_community_summaries.json', {
            assert: { type: 'json' },
        });
        communitySummaries = communitySummaries.default;
    } catch (e) {
        console.error(e);
        return { text: noDataFoundMessage, conversation: conversation };
    }

    const mapModel = 'gpt4oMini';
    const reduceModel = 'gpt4o';
    const role = 'system';
    const promises = [];
    const maxTokenLimit = 128000;

    let index = 0;
    for (const community of communitySummaries) {
        if (!INCLUDE_MWAS_IN_GRAPH_RAG) {
            delete community.mwas;
        }

        const communityPrompt = getGraphRAGMapSystemPrompt(JSON.stringify(community));
        const communityConversation = [
            ...conversation,
            {
                role: role,
                content: communityPrompt,
            },
            {
                role: 'user',
                content: message,
            },
        ];
        const result = runLLMCompletion(communityConversation, mapModel);
        promises.push(result);
        index++;
    }

    const results = await Promise.all(promises);

    let parsedResults = results.map((result) => {
        try {
            return JSON.parse(result.text);
        } catch (e) {
            return {};
        }
    });

    parsedResults = parsedResults.filter((result) => result.points && result.points.length > 0);
    parsedResults = parsedResults.map((result) => {
        result.points = result.points.filter((point) => point.description && point.score && point.score >= 0);
        return result;
    });
    parsedResults = parsedResults.filter((result) => result.points && result.points.length > 0);
    parsedResults = parsedResults.sort((a, b) => b.score - a.score);

    if (parsedResults.length === 0) {
        return { text: noDataFoundMessage, conversation: conversation };
    }

    let content = JSON.stringify(parsedResults);
    if (content.length > maxTokenLimit) {
        console.log(`GraphRAG content length exceeds ${maxTokenLimit} characters. ${content.length}`);
        parsedResults = parsedResults.slice(0, 100);
        content = JSON.stringify(parsedResults);
        console.log(`GraphRAG content length after truncation: ${content.length}`);
    }

    const reducerConversation = [
        ...conversation,
        {
            role: role,
            content: getGraphRAGReduceSystemPrompt(JSON.stringify(parsedResults)),
        },
    ];
    const reducerResult = await runLLMCompletion(reducerConversation, reduceModel);

    const displayedConversation = [
        {
            role: 'user',
            content: message,
        },
        ...reducerConversation,
        {
            role: role,
            content: reducerResult.text,
        },
    ];
    return { text: reducerResult.text, conversation: displayedConversation };
};
