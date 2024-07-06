export const sectionConfig = {
    'SRA Experiment': {
        modules: ['host', 'seqType', 'bioproject'],
    },
    'Palmdb Virome': {
        modules: ['sotu', 'family', 'species'],
    },
    'Context': {
        modules: ['geography', 'statHost', 'tissue'],
    },
};

export const moduleConfig = {
    host: {
        title: 'Organism label',
        tag: 'Organism',
        groupByKey: 'host_label',
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
    seqType: {
        title: 'Dataset type',
        tag: 'Dataset type',
        groupByKey: 'library_strategy',
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
        title: 'STAT Host',
        tag: 'STAT',
        groupByKey: 'stat_host_order',
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
    },
};
