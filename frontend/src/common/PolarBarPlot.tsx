import React from 'react';
import ReactEcharts from 'echarts-for-react';

const PolarBarPlot = ({ plotData = {}, styles = {}, onEvents = {} }) => {
    const defaultConfig = {
        backgroundColor: 'transparent',
        textStyle: {
            color: 'white',
        },
        subtextStyle: {
            color: 'white',
        },
        grid: {
            left: '-1%',
            borderColor: 'transparent',
        },
        legend: {
            textStyle: {
                color: 'white',
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
        },
        animation: true,
        angleAxis: {
            type: 'category',
        },
        polar: {
            radius: ['15%', '80%'],
        },
        radiusAxis: {},
    };

    const maxVal =
        Math.max(...plotData.dataset.source.map((d) => d.target), ...plotData.dataset.source.map((d) => d.control)) *
        1.1;

    const options = {
        ...defaultConfig,
        ...plotData,
        series: [
            {
                coordinateSystem: 'polar',
                ...plotData.series[0],
            },
            {
                coordinateSystem: 'polar',
                ...plotData.series[1],
            },
        ],
        radiusAxis: {
            max: parseFloat(maxVal.toFixed(0)),
            axisLabel: {
                show: false,
            },
        },
    };

    return <ReactEcharts option={options} style={styles} onEvents={onEvents} />;
};

export default PolarBarPlot;
