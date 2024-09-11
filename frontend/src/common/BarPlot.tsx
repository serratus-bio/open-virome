import React from 'react';
import ReactEcharts from 'echarts-for-react';

const BarPlot = ({ plotData = {}, styles = {}, onEvents = {} }) => {
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
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
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
            type: 'category',
        },
        series: [],
    };

    const options = {
        ...defaultConfig,
        ...plotData,
    };

    options.series.forEach((obj) => {
        if (obj.label != null) {
            obj.label.position = ['50%', '5%']
        }
    });

    return <ReactEcharts option={options} style={styles} onEvents={onEvents} />;
};

export default BarPlot;
