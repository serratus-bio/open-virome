import { getMWASResults } from "./mwas.mjs"
import { runCypherQuery } from '../clients/neo4j.mjs';
import { runLLMCompletion } from '../clients/oai.mjs';

export const getMwasHypothesis = async (bioprojects, targetVirusFamilies, pageStart, pageEnd, identifiers) => {

    let model, role;
    model = 'gpt4o';
    if (model === 'gpt4o') {
        role = 'system';
    } else {
        role = 'assistant'; // o1
    }


    const results = await getMWASResults(bioprojects, targetVirusFamilies, pageStart, pageEnd);
    const TARGET_QUERY = "Eimeria"
    const test = {text: "Display this"}

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

    // contextual_info = bioproject_df[bioproject_df['bioproject'] != result['bioproject_id']]
    // contextual_info = contextual_info.to_dict(orient='records')
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
    for(const result of results) {
        const change_in_viral_load = result['mean_rpm_true'] - result['mean_rpm_false']
        const target_info_prompt = `
            Target Information:
            - Host: ${TARGET_QUERY}
            - Virus Family: ${result['family']}
            - Significant metadata term: ${result['metadata_field']}
            - Significant metadata value: ${result['metadata_value']}
            - Mean change in viral reads per million (RPM) between positive and negative samples: ${change_in_viral_load}
            - Target BioProject: ${result['bioproject']}
            - Target BioProject Title: ${bioprojects_dict[result['bioproject']]['title']}
            - Target BioProject Description: ${bioprojects_dict[result['bioproject']]['description']}
            - Target BioProject Name: ${bioprojects_dict[result['bioproject']]['name']}
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

        const prompts = [prompt_1, prompt_2]
        const conversation = []
        for(const prompt of [prompt_1, prompt_2]){
            conversation.push({
                role: role,
                content: prompt,
            })
            const result = await runLLMCompletion(conversation, model);
            hypotheses.push(result)
        }
        console.log(hypotheses)

        break; // just do 1 hypothesis for now
    }
    const combinedText = hypotheses.map(hypothesis => hypothesis.text).join('\n')
    return {text : combinedText}
};