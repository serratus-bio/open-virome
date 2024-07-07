import React from 'react';
import ReactEcharts from 'echarts-for-react';

const PolarBarPlot = ({ plotData = {}, styles = {} }) => {
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
            radius: [10, '80%'],
        },
        radiusAxis: {},
    };

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
    };

    return <ReactEcharts option={options} style={styles} />;
};

export default PolarBarPlot;
