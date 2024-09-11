import { truncate } from '../../../common/utils/textFormatting.ts';
import chroma from 'chroma-js';

export const getViromeGraphData = (rows = [], groupByKey = 'sotu') => {
    const missingLabelVal = 'N/A';

    // Limit data to 1000 rows because of cytoscape performance issues
    let data;
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
    if (rows.length > 1000) {
        data = getRandomSubarray(rows, 1000);
    } else {
        data = rows;
    }

    // Group data by run
    let runsToRowData = {};
    data.forEach((row) => {
        const label =
            groupByKey === 'tax_family' ? row['tax_family'] : groupByKey === 'sotu' ? row['sotu'] : row['tax_species'];
        const rowData = {
            sotu: row['sotu'],
            run: row['run'],
            tax_species: row['tax_species'],
            tax_family: row['tax_family'],
            gb_acc: row['gb_acc'],
            node_pid: row['node_pid'],
            node_coverage: row['node_coverage'],
            gb_pid: row['gb_pid'],
            label: label,
        };
        if (row['run'] in runsToRowData) {
            runsToRowData[row['run']].push(rowData);
        } else {
            runsToRowData[row['run']] = [rowData];
        }
    });

    // Group data by groupByKey (i.e. tax_species, tax_family, sotu)
    const runsToGroupedRowData = {};
    for (const run in runsToRowData) {
        const groupedRowData = runsToRowData[run].reduce((acc, row) => {
            if (!row[groupByKey]) {
                row[groupByKey] = missingLabelVal;
            }
            if (row[groupByKey] in acc) {
                acc[row[groupByKey]].push(row);
            } else {
                acc[row[groupByKey]] = [row];
            }
            return acc;
        }, {});
        runsToGroupedRowData[run] = groupedRowData;
    }

    // Color virus nodes by sOTU
    const getColorMapping = () => {
        const sOTUsToColor = {};
        let sOTUsData = Object.values(runsToRowData).flat();
        sOTUsData = sOTUsData.filter(
            (sOTU, index, self) => self.findIndex((t) => t['sotu'] === sOTU['sotu']) === index,
        );
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
        sOTUsData.forEach((sOTU, index) => {
            sOTUsToColor[sOTU['sotu']] = colors[index];
        });
        return sOTUsToColor;
    };

    const virusToColor = getColorMapping();
    const numSOTUS = Object.keys(virusToColor).length;

    // rescale edge weight using node_pid
    const getEdgeWeight = (row) => {
        return (parseInt(row['node_pid']) / 100) * 15;
    };

    // Rescale edge width using coverage
    const getEdgeWidth = (row) => {
        let rescaledValue = row['node_coverage'];

        const minScale = 0;
        const maxScale = 100;
        const minRescale = 3;
        const maxRescale = 20;

        if (rescaledValue < minScale) {
            rescaledValue = minScale;
        } else if (rescaledValue > maxScale) {
            rescaledValue = maxScale;
        }
        return Math.round(
            ((rescaledValue - minScale) / (maxScale - minScale)) * (maxRescale - minRescale) + minRescale,
        );
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
                    label: truncate(row['label'], 40) ?? missingLabelVal,
                    color: virusToColor[row['sotu']],
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
                    node_coverage: row['node_coverage'],
                    width: getEdgeWidth(row),
                    weight: getEdgeWeight(row),
                    color: virusToColor[row['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
        });
    }
    return plotData;
};

export const getScatterPlotData = (rows = []) => {
    const tooltipFormatter = (args) => {
        if (!rows || !rows[args.dataIndex]) {
            return '';
        }
        const componentId = rows[args.dataIndex][2] + 1;
        const nodes = rows[args.dataIndex][0];
        const edges = args.value[1];
        return `${args.marker} Component: ${componentId} <br /> &ensp; &ensp; Nodes: ${nodes} <br />  &ensp; &ensp; Edges: ${edges}<br />`;
    };

    return {
        color: '#4CB9F1',
        xAxis: {
            type: 'value',
            name: 'Nodes # (Virus + Run)',
            nameLocation: 'middle',
            nameGap: 30,
        },
        yAxis: {
            type: 'value',
            name: 'Edges # (contigs)',
            nameLocation: 'middle',
            nameGap: 35,
        },
        grid: {
            left: '6%',
            right: '6%',
            bottom: '6%',
            containLabel: true,
            borderColor: 'white',
        },
        title: {
            show: true,
            text: '   Virome Component Summary',
            textStyle: {
                color: 'white',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'italic',
            },
            left: 0,
            top: 20,
        },
        dataset: {
            dimensions: ['count', 'percentage'],
            source: rows,
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
                name: 'Components',
                type: 'scatter',
                label: {
                    show: false,
                    color: 'white',
                },
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };
};
