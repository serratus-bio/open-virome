import React from 'react';
import ReactEcharts from 'echarts-for-react';

const HistogramPlot = ({ plotData = {}, styles = {} }) => {
    const defaultConfig = {
        backgroundColor: 'transparent',
        textStyle: {
            color: 'white',
        },
        subtextStyle: {
            color: 'white',
        },
        legend: {
            textStyle: {
                color: 'white',
            },
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
        },
        xAxis: {
            type: 'value',
        },
        yAxis: {
            type: 'value',
        },
        series: [],
    };

    const options = {
        ...defaultConfig,
        ...plotData,
    };

    options.series.forEach((obj) => {
        obj.barWidth = '101%';
        obj.barMaxWidth = 10;
    });

    return <ReactEcharts option={options} style={styles} />;
};

export default HistogramPlot;
