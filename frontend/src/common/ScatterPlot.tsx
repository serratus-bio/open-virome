import React from 'react';
import ReactEcharts from 'echarts-for-react';

const ScatterPlot = ({ plotData = {}, styles = {}, onEvents = {} }) => {
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
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
            borderColor: 'white',
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

    return <ReactEcharts option={options} style={styles} onEvents={onEvents} />;
};

export default ScatterPlot;
