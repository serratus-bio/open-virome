import React, { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';

const BarPlot = ({ plotData = {}, styles = {}, onEvents = {}, imagePath = '' }) => {
    const [imageDimensions, setImageDimensions] = React.useState({ width: 0, height: 0 });
    const [options, setOptions] = React.useState({});

    useEffect(() => {
        const loadImage = (path) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = reject;
                img.src = path;
            });
        };

        const initializeChart = async () => {
            let dimensions = { width: 0, height: 0 }; // Default dimensions when no image
            let aspectRatio = 1; // Default aspect ratio

            if (imagePath) {
                try {
                    dimensions = await loadImage(imagePath);
                    aspectRatio = dimensions.width / dimensions.height;
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            }

            setImageDimensions(dimensions);

            // Dynamically calculate grid space based on image size (default if no image)
            const gridLeft = imagePath ? `${Math.min(30, aspectRatio * 25)}%` : '5%';

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
                    left: gridLeft,
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

            if (imagePath) {
                // Add image if it exists
                options.graphic = {
                    type: 'image',
                    left: '5%', // Fixed placement
                    top: 'center',
                    style: {
                        image: imagePath,
                        width: 100, // Adjust dynamically if needed
                        height: 100 / aspectRatio, // Maintain aspect ratio
                    },
                };
            }

            options.series.forEach((obj) => {
                if (obj.label != null) {
                    obj.label.position = 'inside';
                }
            });
            setOptions(options);
        };
        initializeChart();
    }, [imagePath, plotData]);
    return <ReactEcharts option={options} style={styles} onEvents={onEvents} />;
};

export default BarPlot;
