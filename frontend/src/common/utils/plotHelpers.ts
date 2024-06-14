import { truncate } from './textFormatting.ts';

export const transformRowsToPlotData = (targetRows = [], controlRows = []) => {
    const mergedRows = targetRows
        .map((row) => ({ name: row['name'], target: parseInt(row['count']), control: 0 }))
        .concat(controlRows.map((row) => ({ name: row['name'], target: 0, control: parseInt(row['count']) })))
        .reduce((acc, row) => {
            const existingRow = acc.find((r) => r.name === row.name);
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

    mergedRows.sort((a, b) => a.target + a.control - (b.target + b.control));
    // mergedRows.sort((a, b) => a.target - b.target)

    const getPercentageFromRows = (desiredRows, totalRows) => {
        if (totalRows <= desiredRows) {
            return 0;
        }
        const endPercentage = (1 - desiredRows / totalRows) * 100;
        return Math.floor(endPercentage);
    };

    const dataZoom =
        targetRows.length > 10
            ? [
                  {
                      // scroll zoom
                      type: 'inside',
                      id: 'insideY',
                      yAxisIndex: 0,
                      start: 100,
                      end: getPercentageFromRows(5, targetRows.length),
                      zoomOnMouseWheel: false,
                      moveOnMouseMove: true,
                      moveOnMouseWheel: true,
                  },
              ]
            : [];

    return {
        xAxis: {
            type: 'value',
            max: 'dataMax',
        },
        yAxis: {
            type: 'category',
            axisLabel: {
                formatter: (value) => {
                    return truncate(value, 30);
                },
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
                name: 'Background',
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
