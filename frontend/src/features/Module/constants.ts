export const sectionConfig = {
    'SRA Experiment': {
        modules: ['host', 'seqType', 'bioproject'],
    },
    'Palmdb Virome': {
        modules: ['sotu', 'species', 'family'],
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
        defaultDisplay: 'filter',
    },
    bioproject: {
        title: 'Bioproject',
        tag: 'Bioproject',
        groupByKey: 'bioproject',
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'filter',
    },
    seqType: {
        title: 'Dataset type',
        tag: 'Dataset type',
        groupByKey: 'library_strategy',
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'filter',
    },
    sotu: {
        title: 'sOTU',
        tag: 'sOTU',
        groupByKey: 'sotu',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'filter',
    },
    species: {
        title: 'Virus Species',
        tag: 'Virus Species',
        groupByKey: 'tax_species',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'filter',
    },
    family: {
        title: 'Virus Family',
        tag: 'Virus Family',
        groupByKey: 'tax_family',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'filter',
    },
    geography: {
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo',
        resultsIdColumn: 'biosample',
        resultsTable: 'biosample_geo_coordinates',
        defaultDisplay: 'filter',
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
