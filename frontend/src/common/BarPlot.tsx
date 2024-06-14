import React from 'react';
import ReactEcharts from 'echarts-for-react';

const BarPlot = ({ plotData = {} }) => {
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
        dataZoom: [
            {
                // scroll zoom
                type: 'inside',
                id: 'insideY',
                yAxisIndex: 0,
                start: 0.5,
                end: 0,
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true,
            },
        ],
    };

    const options = {
        ...defaultConfig,
        ...plotData,
    };

    return (
        <div>
            <ReactEcharts option={options} />
        </div>
    );
};

export default BarPlot;
