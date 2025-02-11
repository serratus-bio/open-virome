import React, { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';

const BarPlot = ({ plotData = {}, styles = {}, onEvents = {}, imagePath = "" }) => {
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
                textStyle: { color: 'white' },
                subtextStyle: { color: 'white' },
                legend: { textStyle: { color: 'white' } },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                    borderColor: 'white',
                },
                ...plotData,
            };

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

    return <ReactEcharts option={options} style={styles} onEvents={onEvents} />;
};

export default BarPlot;
