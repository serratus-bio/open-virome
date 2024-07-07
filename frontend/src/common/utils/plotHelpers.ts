import { truncate } from './textFormatting.ts';
import { histogram } from 'echarts-stat';
import chroma from 'chroma-js';

export const shouldDisableFigureView = (identifiers, sectionKey = '') => {
    if (!identifiers) {
        return true;
    }
    if (identifiers?.run?.totalCount === -1) {
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

export const getControlTargetPlotData = (targetRows = [], controlRows = [], countKey = 'count') => {
    const parseCount = (value) => {
        if (countKey === 'count') {
            return parseInt(value);
        } else if (countKey === 'percent') {
            return parseInt(value);
        } else if (countKey === 'gbp') {
            return parseFloat(parseFloat(value).toFixed(1));
        }
        return value;
    };

    const mergedRows = targetRows
        .map((row) => ({ name: row['name'], target: parseCount(row[countKey]), control: 0 }))
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
                target: row.target,
                control: Math.abs(row.control - row.target),
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

    const maxCount = Math.max(...mergedRows.reduce((acc, cur) => acc.concat([cur.target, cur.control]), []));
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

export const getViromeGraphData = (rows = [], groupBy = 'sotu') => {
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
            label: groupBy === 'family' ? row['tax_family'] : groupBy === 'sotu' ? row['sotu'] : row['tax_species'],
        };

        if (row['run'] in runsToRowData) {
            runsToRowData[row['run']].push(rowData);
        } else {
            runsToRowData[row['run']] = [rowData];
        }
    });

    // reduce to groupBy level
    const runsToGroupedRowData = {};
    for (const run in runsToRowData) {
        const groupedRowData = runsToRowData[run].reduce((acc, row) => {
            if (row[groupBy] in acc) {
                acc[row[groupBy]].push(row);
            } else {
                acc[row[groupBy]] = [row];
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
        plotData.push({ data: { id: run, type: 'run', isNode: true } });
        // runsToRowData[run].forEach((sOTU) => {
        Object.keys(runsToGroupedRowData[run]).forEach((groupByKey) => {
            const sOTU = runsToGroupedRowData[run][groupByKey][0];
            plotData.push({
                data: {
                    id: sOTU['sotu'],
                    type: 'sOTU',
                    isNode: true,
                    label: truncate(sOTU['label'], 40) ?? 'N/A',
                    color: sOTUsToColor[sOTU['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
            plotData.push({
                data: {
                    source: run,
                    target: sOTU['sotu'],
                    isNode: false,
                    width: getEdgeWidth(sOTU),
                    weight: getEdgeWeight(sOTU),
                    color: sOTUsToColor[sOTU['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
        });
    }
    return plotData;
};
