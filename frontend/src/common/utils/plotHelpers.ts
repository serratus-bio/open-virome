import { truncate } from './textFormatting.ts';
import { histogram } from 'echarts-stat';
import chroma from 'chroma-js';

export const isSummaryView = (identifiers) => {
    return identifiers && identifiers.run.totalCount === -1;
};

export const shouldDisableFigureView = (identifiers, sectionKey = '') => {
    if (!identifiers) {
        return true;
    }
    return identifiers?.run?.totalCount > 100000;
};

// https://github.com/ecomfe/echarts-stat?tab=readme-ov-file#return-value-only-for-standalone-usage
export function histogramBins(values) {
    let bins = histogram(values, 'squareRoot');
    bins.data.forEach((bin, index) => {
        bins.data[index][1] += bins.data[index][1];
    });
    return bins;
}

export const getControlTargetPlotData = (targetRows = [], controlRows = [], countKey = 'count', maxRows) => {
    const parseCount = (value) => {
        switch (countKey) {
            case 'gbp':
                return parseFloat(parseFloat(value).toFixed(1));
            case 'count':
            case 'percent':
                return Math.round(parseFloat(value));
            default:
                return parseInt(value);
        }
    };

    const targetRowsSet = new Set(targetRows);
    const mergedRows = [...targetRows, ...controlRows].reduce((acc, row) => {
        const name = row.name || 'N/A';
        const count = parseCount(row[countKey]);
        const existingRow = acc.find((r) => r.name === name);
        const isInTarget = targetRowsSet.has(row);
        if (existingRow) {
            existingRow.target += isInTarget ? count : 0;
            existingRow.control += isInTarget ? 0 : count;
        } else {
            acc.push({
                name,
                target: isInTarget ? count : 0,
                control: isInTarget ? 0 : count,
            });
        }
        return acc;
    }, []);

    mergedRows.forEach((row) => {
        row.target = parseCount(row.target);
        row.control = countKey == 'percent' ? parseCount(row.control) : parseCount(Math.abs(row.control - row.target));
    });

    mergedRows.sort((a, b) => a.target + a.control - (b.target + b.control));

    if (maxRows && mergedRows.length > maxRows) {
        const others = mergedRows.slice(0, mergedRows.length - maxRows).reduce(
            (acc, row) => {
                acc.target += row.target;
                acc.control += row.control;
                return acc;
            },
            { name: 'Other', target: 0, control: 0 },
        );

        mergedRows.splice(0, mergedRows.length - maxRows, others);
    }

    const getZoomPercentage = (desiredRows, totalRows) => {
        if (totalRows <= desiredRows) {
            return 0;
        }
        const percentage = (desiredRows / totalRows) * 100;
        return Math.min(100, Math.max(0, 100 - percentage));
    };

    const dataZoom = [
        {
            type: 'inside',
            id: 'insideY',
            yAxisIndex: 0,
            start: 100,
            end: getZoomPercentage(10, mergedRows.length),
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
        },
    ];

    const maxCount = Math.max(...mergedRows.flatMap((row) => [row.target, row.control]));

    return {
        xAxis: {
            type: 'value',
            max: maxCount,
        },
        yAxis: {
            type: 'category',
            axisLabel: {
                formatter: (value) => truncate(value, 20),
            },
        },
        dataset: {
            dimensions: ['name', 'target', 'control'],
            source: mergedRows,
        },
        series: [
            {
                name: 'Target',
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
                name: 'Control',
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
    const values = controlRows.map((row) => parseInt(row['count']));
    const bins = histogramBins(values);

    const maxRuns = Math.max(...bins.data.map((bin) => bin[3]));
    const maxCount = Math.max(...bins.data.map((bin) => bin[1]));

    const tooltipFormatter = (args) => {
        const count = args[0].value[1];
        const runs = args[0].value[4];
        return `${args[0].marker} ${count} ${args[0].seriesName} <br />  &ensp; &ensp;  ${runs} Runs`;
    };

    return {
        xAxis: {
            name: 'Runs (n)',
            nameLocation: 'middle',
            nameGap: 24,
            boundaryGap: ['0%', '5%'],
            max: maxRuns,
            // type: maxRuns > 1000 ? 'log' : 'value',
        },
        yAxis: {
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 40,
            minInterval: 1,
            boundaryGap: ['0%', '10%'],
            // type: maxCount > 100 ? 'log' : 'value',
        },
        legend: {
            show: false,
        },
        tooltip: {
            trigger: 'axis',
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
        grid: {
            left: 55,
            right: 15,
        },
        series: [
            {
                name: `BioProjects`,
                type: 'bar',
                stack: 'total',
                label: {
                    show: false,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'gray',
                data: bins.data,
            },
        ],
    };
};

export const getBioprojectTargetPercentagePlotData = (controlRows = [], targetRows = []) => {
    const percentageToNumRuns = controlRows.map((row) => {
        const bioprojectId = row['name'];
        const targetRow = targetRows.find((targetRow) => targetRow['name'] === bioprojectId);
        let percentage = targetRow ? parseInt((parseFloat(targetRow['count']) / parseFloat(row['count'])) * 100) : 0;
        if (percentage == 100) {
            percentage = 99;
        }
        return percentage;
    });

    const bins = histogramBins(percentageToNumRuns);
    const maxCount = Math.max(...bins.data.map((bin) => bin[1]));

    const tooltipFormatter = (args) => {
        const count = args[0].value[1];
        const percentage = args[0].value[4];
        return `${args[0].marker} ${count} ${args[0].seriesName} <br />  &ensp; &ensp;  ${percentage}% in target set`;
    };

    return {
        xAxis: {
            type: 'value',
            name: 'Target (%)',
            nameLocation: 'middle',
            nameGap: 25,
            boundaryGap: ['-10%', '0%'],
            max: 100,
        },
        yAxis: {
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 40,
            minInterval: 1,
            boundaryGap: ['0%', '10%'],
            // type: maxCount > 100 ? 'log' : 'value',
        },
        grid: {
            left: 55,
            right: 15,
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
            trigger: 'axis',
            formatter: tooltipFormatter,
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
                    show: false,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
                color: 'gray',
                data: bins.data,
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
            nameGap: 20,
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

const getRandomSubarray = (arr, size) => {
    var shuffled = arr.slice(0),
        i = arr.length,
        temp,
        index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

export const getViromeGraphData = (rows = [], groupByKey = 'sotu') => {
    let runsToRowData = {};
    let data;
    if (rows.length > 1000) {
        data = getRandomSubarray(rows, 1000);
    } else {
        data = rows;
    }

    data.forEach((row) => {
        const rowData = {
            sotu: row['sotu'],
            tax_species: row['tax_species'],
            tax_family: row['tax_family'],
            gb_acc: row['gb_acc'],
            node_pid: row['node_pid'],
            gb_pid: row['gb_pid'],
            label:
                groupByKey === 'tax_family'
                    ? row['tax_family']
                    : groupByKey === 'sotu'
                      ? row['sotu']
                      : row['tax_species'],
        };

        if (row['run'] in runsToRowData) {
            runsToRowData[row['run']].push(rowData);
        } else {
            runsToRowData[row['run']] = [rowData];
        }
    });

    // reduce to groupByKey level
    const runsToGroupedRowData = {};
    for (const run in runsToRowData) {
        const groupedRowData = runsToRowData[run].reduce((acc, row) => {
            if (row[groupByKey] in acc) {
                acc[row[groupByKey]].push(row);
            } else {
                acc[row[groupByKey]] = [row];
            }
            return acc;
        }, {});
        runsToGroupedRowData[run] = groupedRowData;
    }

    let sOTUsData = Object.values(runsToRowData).flat();
    sOTUsData = sOTUsData.filter((sOTU, index, self) => self.findIndex((t) => t['sotu'] === sOTU['sotu']) === index);
    sOTUsData.sort((a, b) => {
        if (!a['tax_family'] || !b['tax_family']) {
            return 0;
        }
        if (a['tax_family'] < b['tax_family']) {
            return -1;
        }
        if (a['tax_family'] > b['tax_family']) {
            return 1;
        }
        return 0;
    });
    const numSOTUS = sOTUsData.length;
    const hueStep = 360 / numSOTUS;
    const colors = Array.from({ length: numSOTUS }, (_, i) => chroma.hsl(hueStep * i, 1, 0.6).hex());
    const sOTUsToColor = {};
    sOTUsData.forEach((sOTU, index) => {
        sOTUsToColor[sOTU['sotu']] = colors[index];
    });
    const getEdgeWidth = (sOTU) => {
        return (parseInt(sOTU['node_pid']) / 100) * 15;
    };
    const getEdgeWeight = (sOTU) => {
        return parseInt(sOTU['node_pid']) / 100;
    };

    const plotData = [];
    for (const run in runsToGroupedRowData) {
        plotData.push({
            group: 'nodes',
            data: {
                id: run,
                type: 'run',
                isNode: true,
            },
        });
        Object.keys(runsToGroupedRowData[run]).forEach((groupByValue) => {
            const row = runsToGroupedRowData[run][groupByValue][0];
            const rowValue = row[groupByKey];
            if (!rowValue) {
                return;
            }
            plotData.push({
                group: 'nodes',
                data: {
                    id: rowValue,
                    type: 'virus',
                    isNode: true,
                    label: truncate(row['label'], 40) ?? 'N/A',
                    color: sOTUsToColor[row['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
            plotData.push({
                group: 'edges',
                data: {
                    id: `${run}-${rowValue}`,
                    source: run,
                    target: rowValue,
                    isNode: false,
                    width: getEdgeWidth(row),
                    weight: getEdgeWeight(row),
                    color: sOTUsToColor[row['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
        });
    }
    return plotData;
};
