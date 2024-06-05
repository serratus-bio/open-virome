export const moduleConfig = {
    phylum: {
        title: 'Phylum',
        tag: 'Phylum',
        groupByKey: 'phylum_name',
        resultsTable: 'rphylum',
    },
    family: {
        title: 'Family',
        tag: 'Family',
        groupByKey: 'family_name',
        resultsTable: 'rfamily2',
    },
    palmprint: {
        title: 'RdRP palmprint',
        tag: 'Palmprint',
        groupByKey: 'sotu',
        resultsTable: 'palm_sra2',
    },
    date: {
        title: 'Collection date',
        tag: 'Date',
        groupByKey: 'release_date',
        resultsTable: 'srarun',
    },
    geography: {
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo',
        resultsTable: 'biosample_geo_coordinates',
    },
    ecology: {
        title: 'Ecological zone',
        tag: 'Ecology',
        groupByKey: null,
        resultsTable: null,
    },
    tissue: {
        title: 'Tissue',
        tag: 'Tissue',
        groupByKey: 'tissue',
        resultsTable: 'biosample_tissue',
    },
    host: {
        title: 'Organsim label',
        tag: 'Organism',
        groupByKey: 'host_label',
        resultsTable: 'srarun',
    },
    statHost: {
        title: 'STAT Host',
        tag: 'STAT Host',
        groupByKey: 'stat_host_order',
        resultsTable: 'sra_stat',
    },
    bioproject: {
        title: 'Bioproject',
        tag: 'Bioproject',
        groupByKey: 'bioproject',
        resultsTable: 'srarun',
    },
};
