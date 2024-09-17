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
        biosample_geo_virome: {
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
        SELECT ${remappedGroupBy} as name, COUNT(*) as count, SUM(mbases)/POWER(10,3) as gbp
        FROM ${table}
        ${clauses}
        GROUP BY ${remappedGroupBy}
    `;
};

export const hasNoGroupByFilters = (filters, groupBy) => {
    return !filters.filter((filter) => filter.groupByKey !== groupBy).length > 0;
};

export const getCachedCountsQuery = (groupBy, searchStringQuery) => {
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
        ${searchStringQuery}
    `;
};

export const getSearchStringClause = (searchString, filters, groupBy) => {
    if (searchString === undefined) {
        return '';
    }
    const searchStrings = searchString
        .split(/[,\s]/)
        .map((substring) => substring.trim())
        .filter(Boolean);
    const columnName = hasNoGroupByFilters(filters, groupBy) ? 'name' : groupBy;
    const likeStatements = searchStrings.map((searchString) => {
        return `LOWER(${columnName}) LIKE LOWER('%${searchString}%')`;
    });
    return `WHERE ${likeStatements.join(' OR ')}`;
};

export const getGroupedCountsByFilters = ({ filters, groupBy, searchStringQuery }) => {
    const tableJoin = getMinimalJoinSubQuery(filters, groupBy);
    return `
        SELECT ${groupBy} as name${hasNoGroupByFilters(filters, groupBy) ? '' : `, COUNT(*) as count`}
        FROM (${tableJoin}) as open_virome
        ${searchStringQuery}
        GROUP BY ${groupBy}
    `;
};

export const getMinimalJoinSubQuery = (filters, groupBy = undefined) => {
    const filterTypes = filters.map((filter) => filter.groupByKey);

    const tableToInnerSelect = {
        sra: 'acc as run_id, bioproject as bioproject, biosample as biosample, organism as organism, assay_type',
        sra_stat: 'run as run_id, name as stat_host_order',
        biosample_tissue: 'biosample_id as biosample, tissue',
        biosample_geo_virome: 'accession as biosample, attribute_value as geo_attribute_value',
        palm_virome: 'run as run_id, sotu, tax_species, tax_family',
    };

    const tableToColumn = {
        sra: ['acc', 'bioproject', 'biosample', 'organism', 'assay_type'],
        sra_stat: ['run_id', 'stat_host_order'],
        palm_virome: ['run', 'sotu', 'tax_species', 'tax_family'],
        biosample_tissue: ['biosample_id', 'tissue'],
        biosample_geo_virome: ['accession', 'geo_attribute_value'],
    };

    const tableToJoinKey = {
        sra: 'run_id',
        sra_stat: 'run_id',
        palm_virome: 'run_id',
        biosample_tissue: 'biosample',
        biosample_geo_virome: 'biosample',
    };

    // Helper function to get tables based on filters or groupBy
    const getRelevantTables = (keys) => {
        return [
            ...new Set(
                keys.flatMap((key) => Object.keys(tableToColumn).filter((table) => tableToColumn[table].includes(key))),
            ),
        ];
    };

    // Determine relevant tables from filters and groupBy
    let tables = filters.length ? getRelevantTables(filterTypes) : [];
    if (groupBy !== undefined) {
        tables = [...tables, ...getRelevantTables([groupBy])];
    }

    // Default join order has sra table first, remove duplicate tables
    tables = ['sra', ...tables.filter((table) => table !== 'sra')];
    tables = [...new Set(tables)];

    // Helper to build join statements
    const buildJoinStatement = (table, index, selectStatement, whereStatement, tableJoinKey) => {
        if (index === 0) {
            return `(
                SELECT ${selectStatement} FROM ${table}
                ${whereStatement}
            ) as ${table}`;
        } else {
            return `INNER JOIN (
                SELECT ${selectStatement}
                FROM ${table}
                ${whereStatement}
            ) as ${table} ON sra.${tableJoinKey} = ${table}.${tableJoinKey}`;
        }
    };

    // Build join statements
    const joinStatements = tables.map((table, i) => {
        const columns = tableToColumn[table];
        const tableJoinKey = tableToJoinKey[table];
        let tableFilters = filters.filter((filter) => columns.includes(filter.groupByKey));

        // Adjust filter keys to account for irregularities
        tableFilters = tableFilters.map((filter) => ({
            ...filter,
            filterKey: handleIdKeyIrregularities(filter.filterKey, table),
        }));

        const isSingleOrFirstTable = i === 0 || columns.includes(groupBy) || tableFilters.length > 0;

        const selectStatement = isSingleOrFirstTable ? tableToInnerSelect[table] : tableJoinKey;

        const whereStatement = tableFilters.length > 0 ? `WHERE ${getFilterClauses(tableFilters, table)}` : '';

        return buildJoinStatement(table, i, selectStatement, whereStatement, tableJoinKey);
    });

    // Construct select statements
    const selectStatements = ['sra.run_id as run_id, sra.biosample as biosample, sra.bioproject as bioproject'];
    if (groupBy !== undefined && !selectStatements[0].includes(groupBy)) {
        const groupByTable = tables.find((table) => tableToColumn[table].includes(groupBy));
        selectStatements.push(`${groupByTable}.${groupBy} as ${groupBy}`);
    }

    // Final query construction
    return `
        SELECT ${selectStatements.join(', ')}
        FROM ${joinStatements.join('\n')}
    `;
};
