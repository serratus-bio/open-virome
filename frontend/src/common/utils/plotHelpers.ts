import { truncate } from './textFormatting.ts';

export const shouldDisableFigureView = (identifiers) => {
    return identifiers && (identifiers?.run?.totalCount === -1 || identifiers?.run?.totalCount > 10000);
};

export const getControlTargetPlotData = (targetRows = [], controlRows = [], countKey = 'count') => {
    const parseCount = (value) => {
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
        .map((row) => ({ name: row['name'], target: parseCount(row[countKey]), control: 0.0 }))
        .concat(controlRows.map((row) => ({ name: row['name'], target: 0.0, control: parseCount(row[countKey]) })))
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
                target: parseCount(row.target),
                control: parseCount(Math.abs(row.control - row.target)),
            };
        });
    mergedRows.sort((a, b) => {
        return a.target + a.control - (b.target + b.control);
    });
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

export const getBioprojectSizePlotData = (controlRows = []) => {
    const countToNumRuns = controlRows.reduce((acc, row) => {
        const numRuns = parseInt(row['count']);
        if (acc[numRuns]) {
            acc[numRuns] += 1;
        } else {
            acc[numRuns] = 1;
        }
        return acc;
    }, {});

    const rows = Object.keys(countToNumRuns).map((numRuns) => {
        return [numRuns, countToNumRuns[numRuns]];
    });
    const maxRuns = Math.max(...rows.map((row) => row[0]));
    const maxCount = Math.max(...rows.map((row) => row[1]));

    const tooltipFormatter = (args) => {
        const count = args.value[1];
        const runs = rows[args.dataIndex][0];
        return `${args.marker} ${count} ${args.seriesName} <br />  &ensp; &ensp;  ${runs} Runs`;
    };

    return {
        xAxis: {
            name: 'Runs (n)',
            nameLocation: 'middle',
            nameGap: 25,
            boundaryGap: ['0%', '5%'],
            type: maxRuns > 1000 ? 'log' : 'value',
        },
        yAxis: {
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 22,
            minInterval: 1,
            boundaryGap: ['0%', '10%'],
            type: maxCount > 100 ? 'log' : 'value',
        },
        dataset: {
            dimensions: ['count', 'runs'],
            source: [...rows],
        },
        legend: {
            show: false,
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
            formatter: tooltipFormatter,
        },
        title: {
            text: 'BioProject size',
            textStyle: {
                color: 'white',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'italic',
            },
            left: 0,
            top: 20,
        },
        series: [
            {
                name: `BioProjects`,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'gray',
            },
        ],
    };
};

export const getBioprojectTargetPercentagePlotData = (controlRows = [], targetRows = []) => {
    const percentageToNumRuns = controlRows.reduce((acc, row) => {
        const bioprojectId = row['name'];
        const targetRow = targetRows.find((targetRow) => targetRow['name'] === bioprojectId);
        const percentage = targetRow ? parseInt((parseFloat(targetRow['count']) / parseFloat(row['count'])) * 100) : 0;

        if (acc[percentage]) {
            acc[percentage] += 1;
        } else {
            acc[percentage] = 1;
        }
        return acc;
    }, {});

    const rows = Object.keys(percentageToNumRuns).map((key) => {
        return [key, percentageToNumRuns[key]];
    });
    const maxPercentage = Math.max(...rows.map((row) => row[0]));
    const maxCount = Math.max(...rows.map((row) => row[1]));
    const tooltipFormatter = (args) => {
        const count = args.value[1];
        const percentage = rows[args.dataIndex][0];
        return `${args.marker} ${count} ${args.seriesName} <br />  &ensp; &ensp;  ${percentage}% Target`;
    };

    return {
        xAxis: {
            type: 'value',
            name: 'Target (%)',
            nameLocation: 'middle',
            nameGap: 25,
            max: maxPercentage < 95 ? 100 : 110,
        },
        yAxis: {
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 22,
            minInterval: 1,
            boundaryGap: ['0%', '10%'],
            type: maxCount > 100 ? 'log' : 'value',
        },
        title: {
            text: '% of BioProject in Target set',
            textStyle: {
                color: 'white',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'italic',
            },
            left: 0,
            top: 20,
        },
        visualMap: {
            show: false,
            type: 'continuous',
            min: 0,
            max: 100,
            dimension: 0,
            inRange: {
                color: ['grey', 'cornflowerblue'],
            },
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
            formatter: tooltipFormatter,
        },
        dataset: {
            dimensions: ['percentage', 'count'],
            source: [...rows],
        },
        legend: {
            show: false,
        },
        series: [
            {
                name: `BioProjects`,
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'gray',
            },
        ],
    };
};

export const getBioprojectSizeVsPercentagePlotData = (controlRows = [], targetRows = []) => {
    const rows = controlRows.map((row) => {
        const bioprojectId = row['name'];
        const targetRow = targetRows.find((targetRow) => targetRow['name'] === bioprojectId);
        const percentage = targetRow ? parseInt((parseFloat(targetRow['count']) / parseFloat(row['count'])) * 100) : 0;
        return [parseInt(row['count']), percentage, bioprojectId];
    });

    const tooltipFormatter = (args) => {
        const bioprojectId = rows[args.dataIndex][2];
        const percentage = args.value[1];
        const runs = rows[args.dataIndex][0];
        return `${args.marker} Bioproject: ${bioprojectId} <br /> &ensp; &ensp; ${percentage}% Target  <br />  &ensp; &ensp; ${runs} Runs <br />`;
    };
    const maxRuns = Math.max(...rows.map((row) => row[0]));

    return {
        xAxis: {
            name: 'Runs (n)',
            nameLocation: 'middle',
            nameGap: 25,
            boundaryGap: ['5%', '5%'],
            type: 'value',
        },
        yAxis: {
            type: 'value',
            name: 'Target (%)',
            nameLocation: 'middle',
            nameGap: 25,
            minInterval: 1,
            boundaryGap: ['5%', '5%'],
        },
        title: {
            text: 'Runs per BioProject vs. BioProject runs in Target set (%)',
            textStyle: {
                color: 'white',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'italic',
            },
            left: 0,
            top: 20,
        },
        visualMap: {
            show: false,
            type: 'continuous',
            min: 0,
            max: 100,
            dimension: 1,
            inRange: {
                color: ['grey', 'cornflowerblue'],
            },
        },
        dataset: {
            dimensions: ['count', 'percentage'],
            source: [...rows],
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
            formatter: tooltipFormatter,
        },
        legend: {
            show: false,
        },
        series: [
            {
                name: `BioProjects size (n runs)`,
                type: 'scatter',
                label: {
                    show: false,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'gray',
            },
        ],
    };
};
