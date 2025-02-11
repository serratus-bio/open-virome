import { truncate, abbreviateNumber } from '../../../common/utils/textFormatting.ts';

export const getBarPlotData = (data, maxRows = undefined, imagePath) => {
    let rows = data.map((row) => {
        return {
            name: row.name,
            count: parseInt(row.count),
        };
    });
    rows.sort((a, b) => a.count - b.count);

    if (maxRows && rows.length > maxRows) {
        const others = rows.slice(0, rows.length - maxRows).reduce(
            (acc, row) => {
                acc.count += row.count;
                return acc;
            },
            { name: 'Other', count: 0 },
        );
        rows.splice(0, rows.length - maxRows, others);
    }

    rows = rows.map((row) => [row.name, row.count]);

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
            end: getZoomPercentage(10, rows.length),
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
        },
    ];

    let imageWidth = 100;
    let imagePadding = 0;
    let estimatedLabelWidth = 0;
    let aspectRatio = 1;
    console.log("2", imagePath);
    if (imagePath) {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            imageWidth = img.width;
        };
        aspectRatio = img.width / img.height
        imagePadding = 30;
        estimatedLabelWidth = Math.max(...rows.map(row => row[0]?.length || 10), 10) * 7;
    }

    const gridLeft = imagePath ? Math.max(imageWidth + imagePadding + estimatedLabelWidth, 150) : 150;
    return {
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: abbreviateNumber,
            },
        },
        yAxis: {
            type: 'category',
            axisLabel: {
                formatter: (value) => truncate(value, 20),
            },
        },
        dataset: {
            dimensions: ['name', 'count'],
            source: rows,
        },
        grid: {
            top: 30,
            left: gridLeft,
            right: 15,
        },
        series: [
            {
                name: 'Count',
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
        ],
        legend: {
            show: false,
            textStyle: {
                color: 'white',
            },
        },
        dataZoom: dataZoom,
        graphic: imagePath
            ? [
                  {
                      type: 'image',
                      left: 10,
                      top: 'center',
                      style: {
                          image: imagePath,
                          width: imageWidth,
                          height: imageWidth / aspectRatio,
                      },
                  },
              ]
            : [],
    };
};
