import { runCypherQuery } from '../clients/neo4j.mjs';
import { runLLMCompletion } from '../clients/oai.mjs';

export const getMwasHypothesis = async (bioprojects, targetVirusFamilies, identifiers, filters, selectedMetadata) => {

    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }

    const TARGET_QUERY = filters[0].filterValue

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

    let contextual_info_prompt = 'Contextual Information:'
    const bioprojects_dict = {}
    for (let info of serializedBioprojects) {
        info = JSON.parse(info)
        contextual_info_prompt += `
        - BioProject: ${info['id'] || ''}
        - Name: ${info['name'] || ''}
        - Title: ${info['title'] || ''}
        - Description: ${info['description'] || ''}
        `
        bioprojects_dict[info['id']] = info
    }

    let hypotheses = []
    const change_in_viral_load = selectedMetadata['mean_rpm_true'] - selectedMetadata['mean_rpm_false']
    const target_info_prompt = `
        Target Information:
        - Host: ${TARGET_QUERY}
        - Virus Family: ${selectedMetadata['family']}
        - Significant metadata term: ${selectedMetadata['metadata_field']}
        - Significant metadata value: ${selectedMetadata['metadata_value']}
        - Mean change in viral reads per million (RPM) between positive and negative samples: ${change_in_viral_load}
        - Target BioProject: ${selectedMetadata['bioproject']}
        - Target BioProject Title: ${bioprojects_dict[selectedMetadata['bioproject']]['title']}
        - Target BioProject Description: ${bioprojects_dict[selectedMetadata['bioproject']]['description']}
        - Target BioProject Name: ${bioprojects_dict[selectedMetadata['bioproject']]['name']}
    `

    const directions_prompt_v2 = `
    1. Provide intuition of a promising research direction investigating why the provided significant metadata term and value are associated with depleted or enriched viral load in the provided organism and virus family.
        Clarify how this research is unique from existing bioprojects and why it is impactful.
    2. From the promising research directions, provide various hypotheses or mechanisms to explore and include a rationale.
        Use up-to-date knowledge in the research literature about the host and virus family as well as any relevant details from provided BioProject name, description, title.
    3. Provide possible implications and impacts of the research direction and hypotheses.
    4. Select and clarify a hypothesis that has the most supoorting evidence to explain the correlation which is also highly specific, testable, and falsifiable.
    `

    const prompt_1 = `
    ${directions_prompt_v2}

    ${target_info_prompt}
    `

    const prompt_2  = `
    ${contextual_info_prompt}

    Use the provided BioProjects to cite reference that further justify the claims of the final hypothesis and techniques in the crucial experiment.
    `
    const conversation = []
    for(const prompt of [prompt_1, prompt_2]){
        conversation.push({
            role: role,
            content: prompt,
        })
        const result = await runLLMCompletion(conversation, model);
        hypotheses.push(result)
    }
    const combinedText = hypotheses.map(hypothesis => hypothesis.text).join('\n')
    return {text : combinedText}
};