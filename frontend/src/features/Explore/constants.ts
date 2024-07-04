export const sectionConfig = {
    'SRA Run': {
        modules: ['host', 'seqType', 'bioproject', 'date'],
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'figure',
    },
    'Palmdb': {
        modules: ['sotu', 'family', 'species'],
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
    },
    'Environment': {
        modules: ['geography'],
        resultsTable: 'biosample_geo_coordinates',
        resultsIdColumn: 'biosample',
        defaultDisplay: 'table',
    },
    'Other': {
        modules: ['statHost', 'tissue'],
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
        // resultsTable: 'biosample_tissue',
        // resultsIdColumn: 'biosample',
        // defaultDisplay: 'table',
    }
};

export const moduleConfig = {
    host: {
        title: 'Organism label',
        tag: 'Organism',
        groupByKey: 'host_label',
    },
    bioproject: {
        title: 'Bioproject',
        tag: 'Bioproject',
        groupByKey: 'bioproject',
    },
    seqType: {
        title: 'Dataset type',
        tag: 'Dataset type',
        groupByKey: 'library_strategy',
    },
    date: {
        title: 'Collection date',
        tag: 'Date',
        groupByKey: 'release_date',
    },
    sotu: {
        title: 'sOTU',
        tag: 'sOTU',
        groupByKey: 'sotu',
    },
    family: {
        title: 'Virus Family',
        tag: 'Virus Family',
        groupByKey: 'tax_family',
    },
    species: {
        title: 'Virus Species',
        tag: 'Virus Species',
        groupByKey: 'tax_species',
    },
    geography: {
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo',
    },
    tissue: {
        title: 'Tissue',
        tag: 'Tissue',
        groupByKey: 'tissue',
    },
    statHost: {
        title: 'STAT Host',
        tag: 'STAT Host',
        groupByKey: 'stat_host_order',
    },
};
