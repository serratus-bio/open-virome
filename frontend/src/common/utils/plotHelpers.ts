import { truncate } from './textFormatting.ts';

export const transformRowsToPlotData = (targetRows = [], controlRows = [], countKey = 'count') => {
    const parseNumber = (value) => {
        if (countKey === 'count') {
            return parseInt(value);
        } else if (countKey === 'percent') {
            return parseInt(value);
        } else if (countKey === 'gbp') {
            return parseFloat(value).toFixed(1);
        }
        return value;
    };

    const mergedRows = targetRows
        .map((row) => ({ name: row['name'], target: parseNumber(row[countKey]), control: 0.0 }))
        .concat(controlRows.map((row) => ({ name: row['name'], target: 0.0, control: parseNumber(row[countKey]) })))
        .reduce((acc, row) => {
            const existingRow = acc.find((existing) => existing.name === row.name);
            if (existingRow) {
                existingRow.target += row.target;
                existingRow.control += row.control;
            } else {
                acc.push(row);
            }
            return acc;
        }, [])
        .map((row) => {
            return {
                name: row.name ? row.name : 'N/A',
                target: parseNumber(row.target),
                control: parseNumber(Math.abs(row.control - row.target)),
            };
        });

    mergedRows.sort((a, b) => a.target + a.control - (b.target + b.control));
    // mergedRows.sort((a, b) => a.target - b.target)

    const getPercentageFromRows = (desiredRows, totalRows) => {
        if (totalRows <= desiredRows) {
            return 0;
        }
        const endPercentage = (1 - desiredRows / totalRows) * 100;
        return Math.floor(endPercentage);
    };

    const dataZoom = [
        {
            // scroll zoom
            type: 'inside',
            id: 'insideY',
            yAxisIndex: 0,
            start: 100,
            end: getPercentageFromRows(10, mergedRows.length),
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
        },
    ];

    const maxCount = Math.max(...mergedRows.map((row) => Math.max(row.target, row.control)));
    return {
        xAxis: {
            type: 'value',
            max: maxCount,
            // max: 'dataMax',
        },
        yAxis: {
            type: 'category',
            axisLabel: {
                formatter: (value) => {
                    return truncate(value, 20);
                },
            },
        },
        dataset: {
            dimensions: ['name', 'target', 'control'],
            source: mergedRows,
        },
        series: [
            {
                id: 'Target',
                name: `Target`,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'cornflowerblue',
            },
            {
                id: 'Control',
                name: `Control`,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'grey',
            },
        ],
        dataZoom: dataZoom,
    };
};
