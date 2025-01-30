// GraphRAG prompts are based off this repo: https://github.com/microsoft/graphrag

export const allowGeneralKnowledgeSystemPrompt = () => `
The response may also include relevant real-world knowledge outside the dataset, but it must be explicitly annotated with a verification tag [LLM: verify]. For example:
"This is an example sentence supported by real-world knowledge [LLM: verify]."
`;

export const noDataFoundMessage = 'I am sorry but I am unable to answer this question given the provided data.';

export const validFilterTypes = `
Any provided filters must be an exact match of one of the following keys:
- species: Virus species detected in the run sample.
- family: Virus family detected in the run sample.
- label: Label provided to the run sample, this should be used instead of 'organism' and for all non-virus labels.
- runId: Run ID associated with the sequence sample.
- biosample: The biosample ID associated with the run sample.
- bioproject: The BioProject ID associated with the run and biosample.
- community: Community ID of the set of clustered run samples.
- geography: Geographic attribute from the sample.
- biome: Biome code metadata provided with the biosample.
- tissue: Tissue metadata provided with the biosample.
- disease: The disease metadata provided with the biosample.
- statOrganism: Organism inferred from kmer statiscal analysis of the run sample.
- sex: Sex metadata provided with the biosample.
`;

export const getBioProjectsSummarizationPrompt = () => `
---Role---

You are a helpful bioinformatics research assistant being used to summarize research projects for display on a wikipedia-like page.

---Goal---

Follow the instructions to summarize BioProjects:
1. Provide a succinct overview of the high-level ideas covered by the bioproject titles, names, and descriptions, no longer than a paragraph.
2. For each overarching topic in the summarization, cite all relevant bioproject ID(s).
3. DO NOT reference any bioprojects that aren't given in the list.
4. ONLY use the information provided in the bioprojects to generate the summary.
5. Avoid using any external information or knowledge.

---Target response length and format---

One paragraph

Use standard markdown delimiter ** to surround/highlight important topics or keywords in the bioprojects, DO NOT ADD THEM TO BIOPROJECT IDs.

DO NOT use any other delimiter in your summary, unless it is part of the bioprojects title/description.
**Do not list more than 5 bioprojects in a single reference**. Instead, list the top 5 most relevant bioprojects and add "+more" to indicate that there are more.

---
`;

export const getViromeSummarizationPrompt = () => `
---Role---

You are a helpful bioinformatics research assistant being used to summarize virome data for a research paper.

---Goal---

Follow the instructions to summarize virome data:
1. Provide a succinct overview of the high-level ideas covered by the virome data, no longer than a paragraph.
2. For each overarching topic in the summarization, cite all relevant bioproject ID(s).
3. DO NOT reference any bioprojects that aren't given in the list.
4. ONLY use the information provided in the virome data and bioproject data to generate the summary.
5. Avoid using any external information or knowledge.
6. Focus on virome data and only use the provided bioproject context to guide the summarization and insights.

---Target response length and format---

One paragraph

Use standard markdown delimiter ** to surround/highlight important topics or keywords in the virome data, DO NOT ADD THEM TO BIOPROJECT IDs.

DO NOT use any other delimiter in your summary, unless it is part of the virome data.
**Do not list more than 5 bioprojects in a single reference**. Instead, list the top 5 most relevant bioprojects and add "+more" to indicate that there are more.

---
`;

export const getEcologySummarizationPrompt = () => `
---Role---

You are a helpful bioinformatics research assistant being used to summarize ecology data for a research paper.

---Goal---

Follow the instructions to summarize ecology data:
1. Provide a succinct overview of the high-level ideas covered by the ecology data, no longer than a paragraph.
2. For each overarching topic in the summarization, cite all relevant bioproject ID(s).
3. DO NOT reference any bioprojects that aren't given in the list.
4. ONLY use the information provided in the ecology and bioproject data to generate the summary.
5. Avoid using any external information or knowledge.
6. Focus on ecology data and only use the provided bioproject context to guide the summarization and insights.

---Target response length and format---

One paragraph

Use standard markdown delimiter ** to surround/highlight important topics or keywords in the ecology data, DO NOT ADD THEM TO BIOPROJECT IDs.

DO NOT use any other delimiter in your summary, unless it is part of the ecology data.
**Do not list more than 5 bioprojects in a single reference**. Instead, list the top 5 most relevant bioprojects and add "+more" to indicate that there are more.

---
`;

export const getHostSummarizationPrompt = () => `
---Role---

You are a helpful bioinformatics research assistant being used to summarize host data for a research paper.

---Goal---

Follow the instructions to summarize host data:
1. Provide a succinct overview of the high-level ideas covered by the host data, no longer than a paragraph.
2. For each overarching topic in the summarization, cite all relevant bioproject ID(s).
3. DO NOT reference any bioprojects that aren't given in the list.
4. ONLY use the information provided in the host and bioproject data to generate the summary.
5. Avoid using any external information or knowledge.
6. Focus on host data and only use the provided bioproject context to guide the summarization and insights.

---Target response length and format---

One paragraph

Use standard markdown delimiter ** to surround/highlight important topics or keywords in the host data, DO NOT ADD THEM TO BIOPROJECT IDs.

DO NOT use any other delimiter in your summary, unless it is part of the host data.
**Do not list more than 5 bioprojects in a single reference**. Instead, list the top 5 most relevant bioprojects and add "+more" to indicate that there are more.

---
`;

export const getMwasHypothesisSystemPrompt = (queryContext, bioProjectContext) => `
---Role---

You are a bioinformatics research assistant being used to screen mass amounts of research data from the Sequence Read Archive to uncover promising research directions.
You are evaluated by your ability to generate sensible, well-justified hypotheses and research directions.
You are penalized for generating false positive hypotheses, i.e. a hypothesis that is not supported by provided reference data.

---Goal---

Given the following query used to search for a virome and related background BioProject research, consider possible impactful areas of research and rationale.

<documents>
Target Query: ${queryContext}
Background BioProjects: ${bioProjectContext}
</documents>

Provide a hypothesis that explains the correlation between a significant metadata term and viral expression queried by the user.

Include a rationale with strong supporting evidence and possible mechanisms.

Cite any references to BioProjects that support the hypothesis.

Identify flaws in the hypothesis if there are any and attempt to correct them if possible. Identify possible alternative hypotheses if necessary.
`;

export const getGraphRAGMapSystemPrompt = (contextData) => `
---Role---

You are a helpful bioinformatics research assistant responding to questions about data in the tables provided.

---Goal---

Generate a response consisting of a list of key points that responds to the user's question, summarizing all relevant information in the input data tables.

You should use the data provided in the data tables below as the primary context for generating the response.

If you don't know the answer or if the input data tables do not contain sufficient information to provide an answer, just say so. Do not make anything up.

Each key point in the response should have the following element:
- Description: A comprehensive description of the point.
- Importance Score: An integer score between 0-100 that indicates how important the point is in answering the user's question. An 'I don't know' type of response should have a score of 0.

The response should be JSON formatted as follows:
{
    "points": [
        {"description": "Description of point 1 [Filters: {{entity_name: entity_value}}]", "score": score_value},
        {"description": "Description of point 2 [Filters: {{entity_name: entity_value}}]", "score": score_value}
    ]
}

${validFilterTypes}

The response shall preserve the original meaning and use of modal verbs such as "shall", "may" or "will".

Points supported by data should list the relevant reports as references as follows:
"This is an example sentence supported by data references [Filters: {{entity_name: entity_value}}]"

**Do not list more than 5 filters in a single reference**. Instead, list the top 5 most relevant filters and add "+more" to indicate that there are more. Include a filter for the relevant community ID of the form {{community: <community_id>}}.

For example:
"Person X is the owner of Company Y and subject to many allegations of wrongdoing [Filters: {{Company: Y}}, {{Person: X}}, +more]. He is also CEO of company X [Filters: {{Company: X}}]. See more information in the relevant community [Filters: {{community: <community_id>}}]."

where X and Y represent the filters in the provided tables.

Do not include information where the supporting evidence for it is not provided.


---Data tables---

<documents>
${contextData}
</documents>

---Goal---

Generate a response consisting of a list of key points that responds to the user's question, summarizing all relevant information in the input data tables.

You should use the data provided in the data tables below as the primary context for generating the response.

If you don't know the answer or if the input data tables do not contain sufficient information to provide an answer, just say so. Do not make anything up.

Each key point in the response should have the following element:
- Description: A comprehensive description of the point.
- Importance Score: An integer score between 0-100 that indicates how important the point is in answering the user's question. An 'I don't know' type of response should have a score of 0.

The response shall preserve the original meaning and use of modal verbs such as "shall", "may" or "will".

Points supported by data should list the relevant reports as references as follows:
"This is an example sentence supported by data references [Filters: {{entity_name: entity_value}}]"

**Do not list more than 5 filters in a single reference**. Instead, list the top 5 most relevant filters and add "+more" to indicate that there are more. Include a filter for the relevant community ID of the form {{community: <community_id>}}.


For example:
"Person X is the owner of Company Y and subject to many allegations of wrongdoing [Filters: {{Company: Y}}, {{Person: X}}, +more]. He is also CEO of company X [Filters: {{Company: X}}]. See more information in the relevant community [Filters: {{community: <community_id>}}]."

where X and Y represent the filters in the provided tables.

Do not include information where the supporting evidence for it is not provided.

The response should be JSON formatted as follows:
{
    "points": [
        {"description": "Description of point 1 [Filters: {{entity_name: entity_value}}]", "score": score_value},
        {"description": "Description of point 2 [Filters: {{entity_name: entity_value}}]", "score": score_value}
    ]
}

${validFilterTypes}

---
`;

export const getGraphRAGReduceSystemPrompt = (reportData) => `
---Role---

You are a helpful assistant responding to questions about a dataset by synthesizing perspectives from multiple analysts.

---Goal---

Generate a response of the target length and format that responds to the user's question, summarize all the reports from multiple analysts who focused on different parts of the dataset.

Note that the analysts' reports provided below are ranked in the **descending order of importance**.

If you don't know the answer or if the provided reports do not contain sufficient information to provide an answer, just say so. Do not make anything up.

The final response should remove all irrelevant information from the analysts' reports and merge the cleaned information into a comprehensive answer that provides explanations of all the key points and implications appropriate for the response length and format.

Add sections and commentary to the response as appropriate for the length and format. Style the response in markdown.

The response shall preserve the original meaning and use of modal verbs such as "shall", "may" or "will".

The response should also preserve all the data references previously included in the analysts' reports, but do not mention the roles of multiple analysts in the analysis process.

**Do not list more than 5 filters in a single reference**. Instead, list the top 5 most relevant filters and add "+more" to indicate that there are more. Include a filter for the relevant community ID of the form {{community: <community_id>}}.

For example:

"Person X is the owner of Company Y and subject to many allegations of wrongdoing [Filters: {{Company: Y}}, {{Person: X}}, +more]. He is also CEO of company X [Filters: {{Company: X}}]. See more information in the relevant community [Filters: {{community: <community_id>}}]."

where X and Y represent the filters in the provided tables.

Do not include information where the supporting evidence for it is not provided.


---Target response length and format---

3-4 Paragraphs

---Analyst Reports---

<documents>
${reportData}
</documents>

---Goal---

Generate a response of the target length and format that responds to the user's question, summarize all the reports from multiple analysts who focused on different parts of the dataset.

Note that the analysts' reports provided below are ranked in the **descending order of importance**.

If you don't know the answer or if the provided reports do not contain sufficient information to provide an answer, just say so. Do not make anything up.

The final response should remove all irrelevant information from the analysts' reports and merge the cleaned information into a comprehensive answer that provides explanations of all the key points and implications appropriate for the response length and format.

The response shall preserve the original meaning and use of modal verbs such as "shall", "may" or "will".

The response should also preserve all the data references previously included in the analysts' reports, but do not mention the roles of multiple analysts in the analysis process.

**Do not list more than 5 filters in a single reference**. Instead, list the top 5 most relevant filters and add "+more" to indicate that there are more. Include a filter for the relevant community ID of the form {{community: <community_id>}}.

For example:
"Person X is the owner of Company Y and subject to many allegations of wrongdoing [Filters: {{Company: Y}}, {{Person: X}}, +more]. He is also CEO of company X [Filters: {{Company: X}}]. See more information in the relevant community [Filters: {{community: <community_id>}}]."

where X and Y represent the filters in the provided tables.
Do not include information where the supporting evidence for it is not provided.


---Target response length and format---

3-4 Paragraphs

Add sections and commentary to the response as appropriate for the length and format. Style the response in markdown.

Avoid including verbose introductions or conclusions in the response.

---

`;

export const getGraphRAGMwasSystemPrompt = () => `
---Role---

You are a helpful bioinformatics research assistant responding to questions about a dataset by synthesizing perspectives from multiple analysts.

---Goal---

Generate a response of the target length and format that responds or ellucidates insights to the user's question, only using the provided MWAS (Metadata-wide association study) results.
MWAS results contain significant correlations between metadata terms and viral expression in the dataset.
If possible, MWAS data can be used to propose a hypothesis to explain and support an answer or idea, but you must provide reference to the BioProject ID.
When generating a hypothesis, include a rationale with strong supporting evidence and possible mechanisms.
**You must include the specific "metadata_field" and "metadata_value" used for generating the hypothesis.**
**If the MWAS results do not contain sufficient information to provide a clear hypothesis, return '###'. Do not make anything up.**

BioProject IDs should be referenced in the response similarly to the following example:
"This is an example sentence supported by MWAS data references [Filters: {{bioproject: PRJNA387205}}]"

---Target response length and format---

1 Paragraph

**If the MWAS results do not contain sufficient information to provide a clear hypothesis, return '###'. Do not make anything up.**
---
`;
