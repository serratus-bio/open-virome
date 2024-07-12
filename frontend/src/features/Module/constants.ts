export const sectionConfig = {
    sra: {
        modules: ['host', 'seqType', 'bioproject'],
        title: 'Run',
    },
    palmdb: {
        modules: ['species', 'family', 'sotu'],
        title: 'Virome',
    },
    context: {
        modules: ['geography', 'statHost', 'tissue'],
        title: 'Metadata',
    },
};

export const moduleConfig = {
    host: {
        title: 'Run Label',
        tag: 'Run Label',
        groupByKey: 'host_label',
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    seqType: {
        title: 'Run Technology',
        tag: 'Run Technology',
        groupByKey: 'library_strategy',
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    bioproject: {
        title: 'Bioproject',
        tag: 'Bioproject',
        groupByKey: 'bioproject',
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
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
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo',
        resultsIdColumn: 'biosample',
        resultsTable: 'biosample_geo_coordinates',
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
