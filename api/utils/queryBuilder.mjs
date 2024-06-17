export const handleIdKeyIrregularities = (key, table) => {
    const tableToRemappedKey = {
        srarun: {
            bioproject: 'bio_project',
            biosample: 'bio_sample',
            run_id: 'run',
            host_label: 'scientific_name',
        },
        sra_stat: {
            run_id: 'run',
        },
        rfamily2: {
            run_id: 'run',
        },
        biosample_tissue: {
            biosample: 'biosample_id',
        },
        biosample_geo_coordinates: {
            biosample: 'biosample_id',
        },
    };
    if (tableToRemappedKey[table] && tableToRemappedKey[table][key]) {
        return tableToRemappedKey[table][key];
    }
    return key;
};

export const getFilterClauses = (filters, groupBy = undefined) => {
    let clauses = [];

    if (groupBy !== undefined) {
        clauses = [...clauses, `${groupBy} IS NOT NULL`];
    }

    if (Object.keys(filters).length > 0) {
        let filterTypes = filters.map((filter) => filter.filterType);
        filterTypes = [...new Set(filterTypes)];
        filterTypes.forEach((filterType) => {
            const filterValues = filters
                .filter((filter) => filter.filterType === filterType)
                .map((filter) => filter.filterValue);

            const filterClauses = filterValues.map((filterValue) => `${filterType} = '${filterValue}'`);
            clauses = [...clauses, `(${filterClauses.join(' OR ')})`];
        });
    }
    return clauses;
};

export const getIdClauses = (ids, idRanges, idColumn, table = 'srarun') => {
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

export const getMinimalJoinSubQuery = (filters, groupBy = undefined) => {
    const filterTypes = filters.map((filter) => filter.filterType);

    const tableToInnerSelect = {
        srarun: "run as run_id, to_char(release_date, 'YYYY-MM') as release_date, bio_project as bioproject, bio_sample as biosample, scientific_name as host_label",
        sra_stat: 'run as run_id, name as stat_host_order, kmer_perc as percent_identity_stat',
        rfamily2: 'run_id, family_name, percent_identity as percent_identity_rfam',
        palm_sra2: 'run_id, sotu, percent_identity as percent_identity_sotu',
        biosample_tissue: 'biosample_id as biosample, tissue, bto_id',
        biosample_geo_coordinates: 'biosample_id as biosample, from_text as geo',
    };

    const tableToColumn = {
        srarun: ['run_id', 'release_date', 'bioproject', 'biosample', 'host_label', 'host_label_tax_id'],
        sra_stat: ['run_id', 'stat_host_order', 'percent_identity_stat'],
        rfamily2: ['run_id', 'family_name', 'percent_identity_rfam'],
        palm_sra2: ['run_id', 'sotu', 'percent_identity_sotu', 'qc_pass_sotu'],
        biosample_tissue: ['biosample_id', 'tissue', 'bto_id'],
        biosample_geo_coordinates: ['biosample_id', 'geo'],
    };

    const tableToJoinKey = {
        srarun: 'run_id',
        sra_stat: 'run_id',
        rfamily2: 'run_id',
        palm_sra2: 'run_id',
        biosample_tissue: 'biosample',
        biosample_geo_coordinates: 'biosample',
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
        tables = [...tables, ...Object.keys(tableToColumn).filter((table) => tableToColumn[table].includes(groupBy))];
    }

    tables = [...new Set(tables)];
    tables = tables.filter((table) => table !== 'srarun');
    tables = ['srarun', ...tables];

    let joinStatements = [];
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const columns = tableToColumn[table];
        const tableJoinKey = tableToJoinKey[table];
        let tableFilters = filters.filter((filter) => columns.includes(filter.filterType));
        tableFilters = tableFilters.map((filter) => {
            return {
                ...filter,
                filterType: handleIdKeyIrregularities(filter.filterType, table),
            };
        });

        const selectStatement =
            i == 0 || columns.includes(groupBy) || tableFilters.length > 0 ? tableToInnerSelect[table] : tableJoinKey;
        const whereStatement = tableFilters.length > 0 ? `WHERE ${getFilterClauses(tableFilters)}` : '';
        if (i > 0) {
            joinStatements.push(`INNER JOIN (
                SELECT ${selectStatement}
                FROM ${table}
                ${whereStatement}
            ) as ${table} ON srarun.${tableJoinKey} = ${table}.${tableJoinKey}`);
        } else {
            joinStatements.push(`(
                SELECT ${selectStatement} FROM ${table}
                ${whereStatement}
            ) as ${table}`);
        }
    }
    let selectStatements = ['srarun.run_id as run_id, srarun.biosample as biosample, srarun.bioproject as bioproject'];
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
