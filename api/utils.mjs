export const getFilterClauses = (filters, groupBy, queryString) => {
    let clauses = [`${groupBy} IS NOT NULL`];

    if (queryString !== undefined) {
        clauses = [...clauses, `${groupBy} LIKE '%${queryString}%'`];
    }

    if (Object.keys(filters).length > 0) {
        const filterTypes = filters.map((filter) => filter.filterType);

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

export const getIdClauses = (ids, idRanges, idColumn) => {
    const clauses = [];
    if (ids.length > 0) {
        clauses.push(`${idColumn} IN (${ids.map((id) => `'${id}'`).join(',')})`);
    }
    if (idRanges.length > 0) {
        idRanges.forEach((range) => {
            const [start, end] = range;
            clauses.push(`${idColumn} BETWEEN '${start}' AND '${end}'`);
        });
    }
    return clauses;
};

export const getNumericSuffix = (str = '') => {
    const match = str.match(/\d+$/);
    return match ? parseInt(match[0]) : null;
};

export const getNumericToIdMap = (ids) => {
    return ids.reduce((acc, id) => {
        const numericSuffix = getNumericSuffix(id);
        if (numericSuffix !== null) {
            if (!acc[numericSuffix]) {
                acc[numericSuffix] = [];
            }
            acc[numericSuffix].push(id);
        }
        return acc;
    }, {});
};

export const reduceConsecutiveToRange = (ids) => {
    const numericToIdMap = getNumericToIdMap(ids);
    const sortedNumericSuffixes = Object.keys(numericToIdMap).sort((a, b) => a - b);

    const idSingles = [];
    const idRanges = [];

    let prevStart = sortedNumericSuffixes[0];
    let prevEnd = sortedNumericSuffixes[0];

    for (let i = 1; i < sortedNumericSuffixes.length; i++) {
        let current = sortedNumericSuffixes[i];

        if (parseInt(current) - parseInt(prevEnd) === 1) {
            prevEnd = current;
        } else {
            if (prevStart === prevEnd) {
                idRanges.push(numericToIdMap[prevStart]);
            } else {
                idSingles.push([numericToIdMap[prevStart], numericToIdMap[prevEnd]]);
            }
            prevStart = current;
            prevEnd = current;
        }
    }

    if (prevStart === prevEnd) {
        idRanges.push(numericToIdMap[prevStart]);
    } else {
        idSingles.push([numericToIdMap[prevStart], numericToIdMap[prevEnd]]);
    }
    return [idSingles, idRanges];
};
