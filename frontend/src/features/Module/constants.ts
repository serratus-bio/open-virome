/**
 * Section Organization and Labels
 */
export const sectionConfig = {
    sra: {
        title: 'SRA Run',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Run-Module',
        modules: ['host', 'seqType', 'bioproject'],
        defaultDisplay: 'figure',
    },
    palmdb: {
        title: 'Virome',
        wikiUrl: 'https://github.com/serratus-bio/open-virome/wiki/Virome-Module',
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
        modules: ['tissue', 'statHost', 'sex'],
        defaultDisplay: 'table',
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
    },
    seqType: {
        title: 'Run Technology',
        tag: 'Run Technology',
        groupByKey: 'assay_type',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
    },
    bioproject: {
        title: 'BioProject',
        tag: 'BioProject',
        groupByKey: 'bioproject',
        resultsTable: 'sra',
        resultsIdColumn: 'acc',
    },
    sotu: {
        title: 'sOTU',
        tag: 'sOTU',
        groupByKey: 'sotu',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
    },
    species: {
        title: 'GenBank Top Hit',
        tag: 'GenBank Top Hit',
        groupByKey: 'tax_species',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
    },
    family: {
        title: 'Virus Family',
        tag: 'Virus Family',
        groupByKey: 'tax_family',
        resultsTable: 'palm_virome',
        resultsIdColumn: 'run',
    },
    geography: {
        title: 'Geography',
        tag: 'Geography',
        groupByKey: 'geo_attribute_value',
        resultsIdColumn: 'biosample',
        resultsTable: 'biosample_geographical_location',
    },
    biome: {
        title: 'Biome',
        tag: 'Biome',
        groupByKey: 'biome_attribute_value',
        resultsIdColumn: 'biosample',
        resultsTable: 'bgl_gm4326_gp4326',
    },
    tissue: {
        title: 'Tissue',
        tag: 'Tissue',
        groupByKey: 'tissue',
        resultsTable: 'biosample_tissue',
        resultsIdColumn: 'biosample',
    },
    statHost: {
        title: 'Host (STAT)',
        tag: 'Host (STAT)',
        groupByKey: 'stat_host_order',
        resultsTable: 'sra_stat',
        resultsIdColumn: 'run',
    },
    sex: {
        title: 'Sex',
        tag: 'Sex',
        groupByKey: 'sex',
        resultsTable: 'biosample_sex',
        resultsIdColumn: 'biosample',
    },
};
