
const getNumericSuffix = (str = '') => {
    const match = str.match(/\d+$/);
    return match ? parseInt(match[0]) : null;
};

const getNumericToIdMap = (ids) => {
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

const reduceConsecutiveToRange = (ids) => {
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
    if (prevStart === prevEnd && prevEnd - prevStart > 1) {
        idRanges.push(numericToIdMap[prevStart]);
    } else if (prevStart !== prevEnd) {
        idSingles.push([numericToIdMap[prevStart], numericToIdMap[prevEnd]]);
    } else {
        idSingles.push([numericToIdMap[prevStart], numericToIdMap[prevEnd]]);
    }
    return [idSingles, idRanges];
};

export const formatIdentifiersResponse = (result) => {
    let runIds = result.map((row) => row.run_id).filter((biosample) => biosample !== null);
    runIds = [...new Set(runIds)];
    const [runIdRanges, runIdSingles] = reduceConsecutiveToRange(runIds);

    let biprojects = result.map((row) => row.bioproject).filter((biosample) => biosample !== null);
    biprojects = [...new Set(biprojects)];
    const [bioprojectRanges, bioprojectSingles] = reduceConsecutiveToRange(biprojects);

    let biosamples = result.map((row) => row.biosample).filter((biosample) => biosample !== null);
    biosamples = [...new Set(biosamples)];
    const [biosampleRanges, biosampleSingles] = reduceConsecutiveToRange(biosamples);

    return {
        run: {
            single: runIdSingles,
            range: runIdRanges,
            totalCount: runIds.length,
        },
        bioproject: {
            single: bioprojectSingles,
            range: bioprojectRanges,
            totalCount: biprojects.length,
        },
        biosample: {
            single: biosampleSingles,
            range: biosampleRanges,
            totalCount: biosamples.length,
        },
    }
}