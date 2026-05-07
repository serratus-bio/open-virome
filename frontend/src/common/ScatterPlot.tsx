import React, { useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import ExportButton from '../common/ExportButton.tsx';
import { exportEChartsToPNG } from '../common/utils/exportHelpers.ts';

const ScatterPlot = ({ plotData = {}, styles = {}, onEvents = {} }) => {
    const echartsRef = useRef<any>(null);
    const defaultConfig = {
        backgroundColor: 'transparent',
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
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

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
                <ExportButton
                    onClick={() => {
                        const instance = echartsRef.current?.getEchartsInstance();
                        if (instance) exportEChartsToPNG(instance, 'scatter-plot.png');
                    }}
                />
            </div>
            <ReactEcharts ref={echartsRef} option={options} style={{ width: '100%', height: '100%', ...styles }} onEvents={onEvents} />
        </div>
    );
};

export default ScatterPlot;
