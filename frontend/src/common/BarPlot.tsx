import React, { useEffect, useRef, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import ExportButton from '../common/ExportButton.tsx';
import { exportEChartsToPNG } from '../common/utils/exportHelpers.ts';

const BarPlot = ({ plotData = {}, styles = {}, onEvents = {}, imagePath = "", title = "" }) => {
    const echartsRef = useRef<any>(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 100, height: 100, padding: 20, maxCategoryLength: 0, loaded: false });
    const [options, setOptions] = useState({});

    useEffect(() => {
        const initializeChart = async () => {
            if (imagePath) {
                const maxCategoryLength = Math.max(...plotData.dataset.source.map(row => row[0]?.length || 10), 10) * 7;
                const img = new Image();
                img.src = imagePath;
                img.onload = () => {
                    const aspectRatio = img.width / img.height
                    setImageDimensions({
                        width: 100,
                        height: 100 / aspectRatio,
                        padding: 20,
                        maxCategoryLength: maxCategoryLength,
                        loaded: true, // Ensures we re-render after image loads
                    });
                };
            }
            const gridLeft = imageDimensions.loaded ? Math.max(imageDimensions.width + imageDimensions.padding + imageDimensions.maxCategoryLength, 150) : 150;
            const newOptions = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                ...plotData,
            };

            if (title) {
                newOptions.title = {
                    text: title,
                    textStyle: {
                        color: '#333',
                        fontSize: 14,
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                    },
                    left: 0,
                    top: 5,
                };
            }

            if (imageDimensions.loaded) {
                newOptions.graphic = [
                    {
                        type: 'image',
                        left: 10,
                        top: 'center',
                        style: {
                            image: imagePath,
                            width: imageDimensions.width,
                            height: imageDimensions.height,
                        },
                    },
                ];
                newOptions.grid.left = gridLeft;
            }

            setOptions(newOptions);
        };

        initializeChart();
    }, [imagePath, imageDimensions.loaded, plotData]);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
                <ExportButton
                    onClick={() => {
                        const instance = echartsRef.current?.getEchartsInstance();
                        if (instance) exportEChartsToPNG(instance, 'bar-plot.png');
                    }}
                />
            </div>
            <ReactEcharts ref={echartsRef} option={options} style={styles} onEvents={onEvents} />
        </div>
    );
};

export default BarPlot;
