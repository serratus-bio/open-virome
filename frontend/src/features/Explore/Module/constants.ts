export const sectionConfig = {
    'SRA Run': {
        modules: ['host', 'seqType', 'bioproject', 'date'],
        resultsTable: 'srarun',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
    },
    'Virus family': {
        modules: ['family'],
        resultsTable: 'rfamily2',
        resultsIdColumn: 'run_id',
        defaultDisplay: 'table',
    },
    'Palmdb': {
        modules: ['palmdb'],
        resultsTable: 'palm_sra2',
        resultsIdColumn: 'run_id',
        defaultDisplay: 'table',
    },
    'Environment': {
        modules: ['geography'],
        resultsTable: 'biosample_geo_coordinates',
        resultsIdColumn: 'biosample_id',
        defaultDisplay: 'table',
    },
    'Host': {
        modules: ['statHost'],
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
        defaultDisplay: 'table',
    },
    'Tissue': {
        modules: ['tissue'],
        resultsTable: 'biosample_tissue',
        resultsIdColumn: 'biosample_id',
        defaultDisplay: 'table',
    },
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
    family: {
        title: 'Family',
        tag: 'Family',
        groupByKey: 'family_name',
    },
    palmdb: {
        title: 'Palmdb',
        tag: 'Palmdb',
        groupByKey: 'sotu',
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
