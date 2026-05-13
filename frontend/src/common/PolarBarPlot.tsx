import React, { useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import ExportButton from '../common/ExportButton.tsx';
import { exportEChartsToPNG } from '../common/utils/exportHelpers.ts';

const PolarBarPlot = ({ plotData = {}, styles = {}, onEvents = {}, module = "" }) => {
    const echartsRef = useRef<any>(null);
    const defaultConfig = {
        backgroundColor: 'transparent',
        grid: {
            left: '-1%',
            borderColor: 'transparent',
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

    const options: any = {
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

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
                <ExportButton
                    onClick={() => {
                        const instance = echartsRef.current?.getEchartsInstance();
                        if (instance) exportEChartsToPNG(instance, `open-virome-${module || 'SRA'}-PolarBarPlot.png`);
                    }}
                />
            </div>
            <ReactEcharts ref={echartsRef} option={options} style={styles} onEvents={onEvents} />
        </div>
    );
};

export default PolarBarPlot;
