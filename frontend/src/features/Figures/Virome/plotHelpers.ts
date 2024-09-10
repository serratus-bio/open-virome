import { truncate } from '../../../common/utils/textFormatting.ts';
import chroma from 'chroma-js';

export const getViromeGraphData = (rows = [], groupByKey = 'sotu') => {
    let runsToRowData = {};
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

    data.forEach((row) => {
        const rowData = {
            sotu: row['sotu'],
            run: row['run'],
            tax_species: row['tax_species'],
            tax_family: row['tax_family'],
            gb_acc: row['gb_acc'],
            node_pid: row['node_pid'],
            node_coverage: row['node_coverage'],
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
    const mapWeight = (value) => {
        // rescale input value to the output value
        const minScale = 0;
        const maxScale = 100;
        const minRescale = 3;
        const maxRescale = 20;

        if (value < minScale) {
            value = minScale;
        } else if (value > maxScale) {
            value = maxScale;
        }

        return Math.round(((value - minScale) / (maxScale - minScale)) * (maxRescale - minRescale) + minRescale);
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
                    node_coverage: row['node_coverage'],
                    width: getEdgeWidth(row['node_coverage']),
                    weight: mapWeight(row['node_coverage']),
                    color: sOTUsToColor[row['sotu']],
                    numSOTUS: numSOTUS,
                },
            });
        });
    }
    return plotData;
};
