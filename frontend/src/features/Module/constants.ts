/**
 * Section Organization and Labels
 */
export const sectionConfig = {
    sra: {
        modules: ['host', 'seqType', 'bioproject'],
        title: 'Run Module',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Run-Module',
    },
    palmdb: {
        modules: ['species', 'family', 'sotu'],
        title: 'Virome Module',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Virome-Module',
    },
    context: {
        modules: ['geography', 'statHost', 'tissue'],
        title: 'Metadata Module',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Metadata-Module',
    },
};

/**
 * Module Labels and defaults
 */
export const moduleConfig = {
    host: {
        title: 'Run Label',
        tag: 'Run Label',
        groupByKey: 'organism',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        defaultDisplay: 'figure',
    },
    seqType: {
        title: 'Run Technology',
        tag: 'Run Technology',
        groupByKey: 'assay_type',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        defaultDisplay: 'figure',
    },
    bioproject: {
        title: 'Bioproject',
        tag: 'Bioproject',
        groupByKey: 'bioproject',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
        defaultDisplay: 'figure',
    },
    sotu: {
        title: 'sOTU',
        tag: 'sOTU',
        groupByKey: 'sotu',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    species: {
        title: 'Virus Species',
        tag: 'Virus Species',
        groupByKey: 'tax_species',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    family: {
        title: 'Virus Family',
        tag: 'Virus Family',
        groupByKey: 'tax_family',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    geography: {
        title: 'Ecology',
        tag: 'Ecology',
        groupByKey: 'geo_attribute_value',
        resultsIdColumn: 'biosample',
        resultsTable: 'biosample_geo_virome',
        defaultDisplay: 'figure',
    },
    tissue: {
        title: 'Tissue',
        tag: 'Tissue',
        groupByKey: 'tissue',
        resultsTable: 'biosample_tissue',
        resultsIdColumn: 'biosample',
        defaultDisplay: 'table',
    },
    statHost: {
        title: 'Host (STAT)',
        tag: 'Host (STAT)',
        groupByKey: 'stat_host_order',
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
    },
};
