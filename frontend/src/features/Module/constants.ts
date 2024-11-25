/**
 * Section Organization and Labels
 */
export const sectionConfig = {
    sra: {
        title: 'SRA Run',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Run-Module',
        modules: ['label', 'seqType', 'runId', 'biosample', 'bioproject'],
        defaultDisplay: 'figure',
    },
    palmdb: {
        title: 'Virome',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Virome',
        modules: ['sotu', 'family', 'species'],
        defaultDisplay: 'figure',
    },
    ecology: {
        title: 'Ecology',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Ecology-Module',
        modules: ['geography', 'biome'],
        defaultDisplay: 'figure',
    },
    host: {
        title: 'Host',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Host-Module',
        modules: ['statOrganism', 'tissue', 'disease', 'sex'],
        defaultDisplay: 'figure',
    },
};

/**
 * Module Labels and defaults
 */
export const moduleConfig = {
    label: {
        title: 'Run Label',
        tag: 'Run Label',
        groupByKey: 'organism',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        queryBuilderDisplay: 'table',
    },
    seqType: {
        title: 'Run Technology',
        tag: 'Run Technology',
        groupByKey: 'assay_type',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        queryBuilderDisplay: 'table',
    },
    bioproject: {
        title: 'BioProject',
        tag: 'BioProject',
        groupByKey: 'bioproject',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        queryBuilderDisplay: 'table',
    },
    runId: {
        title: 'Run ID',
        tag: 'Run ID',
        groupByKey: 'acc',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        queryBuilderDisplay: 'input',
    },
    biosample: {
        title: 'BioSample',
        tag: 'BioSample',
        groupByKey: 'biosample',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        queryBuilderDisplay: 'input',
    },
    sotu: {
        title: 'sOTU',
        tag: 'sOTU',
        groupByKey: 'sotu',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        queryBuilderDisplay: 'table',
    },
    species: {
        title: 'GenBank Top Hit',
        tag: 'GenBank Top Hit',
        groupByKey: 'tax_species',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        queryBuilderDisplay: 'table',
    },
    family: {
        title: 'Virus Family',
        tag: 'Virus Family',
        groupByKey: 'tax_family',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        queryBuilderDisplay: 'table',
    },
    geography: {
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo_attribute_value',
        resultsIdColumn: 'biosample',
        resultsTable: 'biosample_geographical_location',
        queryBuilderDisplay: 'table',
    },
    biome: {
        title: 'Biome',
        tag: 'Biome',
        groupByKey: 'biome_attribute_value',
        resultsIdColumn: 'biosample',
        resultsTable: 'bgl_gm4326_gp4326',
        queryBuilderDisplay: 'table',
    },
    tissue: {
        title: 'Tissue',
        tag: 'Tissue',
        groupByKey: 'tissue',
        resultsTable: 'biosample_tissue',
        resultsIdColumn: 'biosample',
        queryBuilderDisplay: 'table',
    },
    statOrganism: {
        title: 'STAT Organism',
        tag: 'STAT Organism',
        groupByKey: 'stat_host_order',
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
        queryBuilderDisplay: 'table',
    },
    disease: {
        title: 'Disease',
        tag: 'Disease',
        groupByKey: 'do_label',
        resultsTable: 'biosample_disease',
        resultsIdColumn: 'biosample',
        queryBuilderDisplay: 'table',
    },
    sex: {
        title: 'Sex',
        tag: 'Sex',
        groupByKey: 'sex',
        resultsTable: 'biosample_sex',
        resultsIdColumn: 'biosample',
        queryBuilderDisplay: 'table',
    },
};
