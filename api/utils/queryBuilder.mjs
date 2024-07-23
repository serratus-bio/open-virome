export const handleIdKeyIrregularities = (key, table) => {
    const tableToRemappedKey = {
        sra: {
            run: 'acc',
        },
        sra_stat: {
            run_id: 'run',
            stat_host_order: 'name',
        },
        biosample_tissue: {
            biosample: 'biosample_id',
        },
        biosample_geographical_location: {
            biosample: 'accession',
            geo_attribute_value: 'attribute_value',
        },
        palm_virome: {
            run_id: 'run',
        },
    };
    if (tableToRemappedKey[table] && tableToRemappedKey[table][key]) {
        return tableToRemappedKey[table][key];
    }
    return key;
};

export const getFilterClauses = (filters, table) => {
    let filterClauses = [];
    if (Object.keys(filters).length > 0) {
        let groupByKeys = filters.map((filter) => filter.groupByKey);
        groupByKeys = [...new Set(groupByKeys)];
        groupByKeys.forEach((groupByKey) => {
            const groupByValues = filters
                .filter((filter) => filter.groupByKey === groupByKey)
                .map((filter) => filter.filterValue);

            filterClauses = [
                ...filterClauses,
                `${handleIdKeyIrregularities(groupByKey, table)} IN (${groupByValues.map((groupByValue) => `'${groupByValue}'`).join(', ')})`,
            ];
        });
    }
    return `${filterClauses.join(' AND ')}`;
};

export const getIdClauses = (ids, idRanges, idColumn, table = 'sra') => {
    const idColumnRemap = handleIdKeyIrregularities(idColumn, table);
    const clauses = [];
    if (ids.length > 0) {
        clauses.push(`${idColumnRemap} IN (${ids.map((id) => `'${id}'`).join(',')})`);
    }
    if (idRanges.length > 0) {
        idRanges.forEach((range) => {
            const [start, end] = range;
            clauses.push(`${idColumnRemap} BETWEEN '${start}' AND '${end}'`);
        });
    }
    return clauses;
};

export const getTotalCountsQuery = ({ ids, idRanges, idColumn, table }) => {
    let clauses = getIdClauses(ids, idRanges, idColumn, table);
    clauses = `${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}`;
    return `
        SELECT COUNT(*) as count
        FROM ${table}
        ${clauses}
    `;
};

export const getGroupedCountsByIdentifiers = ({ ids, idRanges, idColumn, groupBy, table }) => {
    let clauses = getIdClauses(ids, idRanges, idColumn, table);
    let remappedGroupBy = handleIdKeyIrregularities(groupBy, table);
    clauses = `${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}`;
    return `
        SELECT ${remappedGroupBy} as name, COUNT(*) as count, (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()) as percent, SUM(mbases)/POWER(10,3) as gbp
        FROM ${table}
        ${clauses}
        GROUP BY ${remappedGroupBy}
    `;
};

export const hasNoGroupByFilters = (filters, groupBy) => {
    return !filters.filter((filter) => filter.groupByKey !== groupBy).length > 0;
};

export const getCachedCountsQuery = (groupBy) => {
    const groupByToMaterializedView = {
        organism: 'counts_sra_organism',
        bioproject: 'counts_sra_bioproject',
        assay_type: 'counts_sra_assay_type',
        tax_species: 'counts_palm_virome_tax_species',
        tax_family: 'counts_palm_virome_tax_family',
        sotu: 'counts_palm_virome_sotu',
        tissue: 'counts_biosample_tissue',
        geo_attribute_value: 'counts_biosample_geographical_location',
        stat_host_order: 'counts_sra_stat',
    };
    return `
        SELECT * FROM ${groupByToMaterializedView[groupBy]}
    `;
};

export const getGroupedCountsByFilters = ({ filters, groupBy }) => {
    const tableJoin = getMinimalJoinSubQuery(filters, groupBy);
    return `
        SELECT ${groupBy} as name${hasNoGroupByFilters(filters, groupBy) ? '' : `, COUNT(*) as count`}
        FROM (${tableJoin}) as open_virome
        GROUP BY ${groupBy}
    `;
};

export const getMinimalJoinSubQuery = (filters, groupBy = undefined) => {
    const filterTypes = filters.map((filter) => filter.groupByKey);

    const tableToInnerSelect = {
        sra: "acc as run_id, to_char(releasedate, 'YYYY-MM') as releasedate, bioproject as bioproject, biosample as biosample, organism as organism, assay_type",
        sra_stat: 'run as run_id, name as stat_host_order, kmer_perc as percent_identity_stat',
        biosample_tissue: 'biosample_id as biosample, tissue, bto_id',
        biosample_geographical_location: 'accession as biosample, attribute_value as geo_attribute_value',
        palm_virome: 'run as run_id, sotu, palm_id, tax_species, tax_family, gb_pid, node_pid',
    };

    const tableToColumn = {
        sra: ['acc', 'releasedate', 'bioproject', 'biosample', 'organism', 'host_label_tax_id', 'assay_type'],
        sra_stat: ['run_id', 'stat_host_order', 'percent_identity_stat'],
        palm_virome: ['run', 'sotu', 'palm_id', 'tax_species', 'tax_family', 'gb_pid', 'node_pid'],
        biosample_tissue: ['biosample_id', 'tissue', 'bto_id'],
        biosample_geographical_location: ['accession', 'geo_attribute_value'],
    };

    const tableToJoinKey = {
        sra: 'run_id',
        sra_stat: 'run_id',
        palm_virome: 'run_id',
        biosample_tissue: 'biosample',
        biosample_geographical_location: 'biosample',
    };

    let tables = [];

    if (filters.length > 0) {
        filterTypes.forEach((filterType) => {
            tables = [
                ...tables,
                ...Object.keys(tableToColumn).filter((table) => tableToColumn[table].includes(filterType)),
            ];
        });
    }
    if (groupBy !== undefined) {
        //TODO: improve table infered from groupBy, it's possible the mapping is not unique
        tables = [...tables, ...Object.keys(tableToColumn).filter((table) => tableToColumn[table].includes(groupBy))];
    }

    tables = [...new Set(tables)];
    tables = tables.filter((table) => table !== 'sra');
    tables = ['sra', ...tables];

    let joinStatements = [];
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const columns = tableToColumn[table];
        const tableJoinKey = tableToJoinKey[table];
        let tableFilters = filters.filter((filter) => columns.includes(filter.groupByKey));
        tableFilters = tableFilters.map((filter) => {
            return {
                ...filter,
                filterKey: handleIdKeyIrregularities(filter.filterKey, table),
            };
        });
        const selectStatement =
            i == 0 || columns.includes(groupBy) || tableFilters.length > 0 ? tableToInnerSelect[table] : tableJoinKey;
        const whereStatement = tableFilters.length > 0 ? `WHERE ${getFilterClauses(tableFilters, table)}` : '';
        if (i > 0) {
            joinStatements.push(`INNER JOIN (
                SELECT ${selectStatement}
                FROM ${table}
                ${whereStatement}
            ) as ${table} ON sra.${tableJoinKey} = ${table}.${tableJoinKey}`);
        } else {
            joinStatements.push(`(
                SELECT ${selectStatement} FROM ${table}
                ${whereStatement}
            ) as ${table}`);
        }
    }

    let selectStatements = ['sra.run_id as run_id, sra.biosample as biosample, sra.bioproject as bioproject'];
    if (groupBy !== undefined && !selectStatements[0].includes(groupBy)) {
        const groupByTable = tables.find((table) => tableToColumn[table].includes(groupBy));
        selectStatements.push(`${groupByTable}.${groupBy} as ${groupBy}`);
    }

    const query = `
        SELECT ${selectStatements.join(', ')}
        FROM ${joinStatements.join('\n')}
    `;
    return query;
};
