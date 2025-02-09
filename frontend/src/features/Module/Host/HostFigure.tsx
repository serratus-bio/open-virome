import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const HostFigure = ({ svgFile, data }) => {
    const [option, setOption] = useState(null);
    const labels = ['heart', 'large-intestine', 'small-intestine', 'spleen', 'kidney', 'lung', 'liver'];
    const tempdata = [121, 321, 141, 52, 198, 289, 139];
    useEffect(() => {
        const loadSVG = async () => {
            try {
                console.log("Fetching SVG from:", svgFile);
                const response = await fetch("/figures/human.svg");
                if (!response.ok) {
                    throw new Error(`Failed to load SVG: ${response.status}`);
                }
                const svgText = await response.text();
                console.log("SVG Response:", response);
                echarts.registerMap('figure', { svg: svgText });
                const newOption = {
                    tooltip: {},
                    geo: {
                        left: 10,
                        right: '50%',
                        map: 'figure',
                        selectedMode: 'multiple',
                        emphasis: {
                            focus: 'self',
                            itemStyle: { color: null },
                            label: {
                                position: 'bottom',
                                distance: 0,
                                textBorderColor: '#fff',
                                textBorderWidth: 2,
                            },
                        },
                        select: {
                            itemStyle: { color: '#b50205' },
                            label: { show: false, textBorderColor: '#fff', textBorderWidth: 2 },
                        },
                    },
                    grid: { left: '60%', top: '20%', bottom: '20%' },
                    xAxis: {},
                    yAxis: {
                        type: 'category',
                        data: labels,
                    },
                    series: [
                        {
                            type: 'bar',
                            emphasis: { focus: 'self' },
                            data: tempdata,
                        },
                    ],
                };
                setOption(newOption);
            } catch (error) {
                console.error('Error loading SVG:', error);
            }
        };

        if (svgFile) {
            loadSVG();
        }
    }, [svgFile]);

    return option ? <ReactECharts option={option} style={{ height: '600px' }} /> : <p>Loading...</p>;
};

export default HostFigure;
