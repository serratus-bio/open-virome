import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModuleBySection } from '../../app/slice.ts';
import { getViromeGraphData, isSummaryView } from '../../common/utils/plotHelpers.ts';
import { useGetResultQuery } from '../../api/client.ts';
import { moduleConfig } from '../Module/constants.ts';
import { handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';
import cytoscape from 'cytoscape';

import NetworkPlot from '../../common/NetworkPlot.tsx';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DropDownSelect from '../../common/DropdownSelect.tsx';
import ScatterPlot from '../../common/ScatterPlot.tsx';

const ViromeLayout = ({ identifiers }) => {
    const activeModule = useSelector((state) => selectActiveModuleBySection(state, 'palmdb'));
    const [randomized, setRandomized] = useState(0);
    const [activeSubgraph, setActiveSubgraph] = useState('1');
    const [headlessCy, setHeadlessCy] = useState(
        cytoscape({
            headless: true,
            elements: [],
        }),
    );

    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: moduleConfig[activeModule].resultsIdColumn,
            ids: identifiers
                ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].single
                : [],
            idRanges: identifiers
                ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].range
                : [],
            table: moduleConfig[activeModule].resultsTable,
            pageStart: 0,
            pageEnd: isSummaryView(identifiers) ? 300 : undefined,
            sortBy: isSummaryView(identifiers) ? 'gb_pid' : undefined,
        },
        {
            skip: !identifiers,
        },
    );

    useEffect(() => {
        if (headlessCy) {
            const plotData = getViromeGraphData(resultData, moduleConfig[activeModule].groupByKey);
            headlessCy.json({ elements: plotData });
            headlessCy.ready(() => {
                const componentLabels = getComponentOptions();
                if (activeSubgraph !== componentLabels[0]) {
                    setActiveSubgraph(componentLabels[0]);
                } else {
                    setRandomized(randomized + 1);
                }
            });
        }
    }, [resultData, activeModule]);

    const getNetworkPlotData = () => {
        if (activeSubgraph === 'All') {
            return getViromeGraphData(resultData, moduleConfig[activeModule].groupByKey);
        }
        const components = headlessCy.elements().components();
        components.sort((a, b) => b.length - a.length);

        if (!components[parseInt(activeSubgraph) - 1]) {
            return [];
        }
        return components[parseInt(activeSubgraph) - 1].jsons();
    };

    const getComponentOptions = () => {
        const numComponents = headlessCy.elements().components().length;
        let componentLabels;
        if (headlessCy.elements().length < 500) {
            componentLabels = Array.from({ length: numComponents + 1 }, (_, i) => {
                if (i === 0) {
                    return 'All';
                }
                return i.toString();
            });
        } else {
            componentLabels = Array.from({ length: numComponents - 1 }, (_, i) => {
                return (i + 1).toString();
            });
        }
        return componentLabels;
    };

    const renderPlaceholder = () => {
        if (resultError) {
            return (
                <Box>
                    <Typography variant='h6'>Error loading data</Typography>
                </Box>
            );
        }
        if (resultIsFetching) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                        width: '100%',
                    }}
                >
                    <Skeleton variant='rectangular' width={450} height={500} sx={{ mr: 4 }} />
                    <Skeleton variant='rectangular' width={450} height={500} />
                </Box>
            );
        }
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    height: 100,
                    width: '100%',
                }}
            >
                <Typography variant='h6'>No data available</Typography>
            </Box>
        );
    };

    const renderDropdown = () => {
        return (
            <Box sx={{}}>
                <DropDownSelect
                    options={getComponentOptions()}
                    activeOption={activeSubgraph}
                    label='Component'
                    setActiveOption={(event) => {
                        setActiveSubgraph(event.target.value);
                    }}
                />
            </Box>
        );
    };

    const renderNetworkFigure = () => {
        return <NetworkPlot plotData={getNetworkPlotData()} />;
    };

    const getScatterPlotData = () => {
        const components = headlessCy.elements().components();
        components.sort((a, b) => b.length - a.length);

        const rows = components.map((component, index) => {
            const nodes = component.filter((ele) => ele.isNode());
            const edges = component.filter((ele) => ele.isEdge());
            return [nodes.length, edges.length, index];
        });

        const tooltipFormatter = (args) => {
            if (!rows || !rows[args.dataIndex]) {
                return '';
            }
            const componentId = rows[args.dataIndex][2] + 1;
            const nodes = rows[args.dataIndex][0];
            const edges = args.value[1];
            return `${args.marker} Component: ${componentId} <br /> &ensp; &ensp; Nodes: ${nodes} <br />  &ensp; &ensp; Edges: ${edges}<br />`;
        };

        const markLineOpt = {
            animation: false,
            lineStyle: {
                type: 'solid',
                color: 'white',
                width: 1,
            },
            emphasis: {
                disabled: true,
            },
            tooltip: {
                show: false,
            },
            data: [
                [
                    {
                        coord: ['0', '0'],
                        symbol: 'none',
                    },
                    {
                        type: 'max',
                        symbol: 'none',
                    },
                ],
            ],
        };
        return {
            xAxis: {
                type: 'value',
                name: 'Number of nodes',
                nameLocation: 'middle',
                nameGap: 30,
            },
            yAxis: {
                type: 'value',
                name: 'Number of edges',
                nameLocation: 'middle',
                nameGap: 35,
            },
            grid: {
                left: '6%',
                right: '4%',
                bottom: '5%',
                containLabel: true,
                borderColor: 'white',
            },
            title: {
                show: false,
                text: 'Number of nodes vs. edges for each connected component',
                textStyle: {
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                },
                left: 0,
                top: 20,
            },
            dataset: {
                dimensions: ['count', 'percentage'],
                source: rows,
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: tooltipFormatter,
            },
            legend: {
                show: false,
            },
            series: [
                {
                    name: 'Components',
                    type: 'scatter',
                    label: {
                        show: false,
                        color: 'white',
                    },
                    emphasis: {
                        focus: 'series',
                    },
                    // markLine: markLineOpt,
                },
            ],
        };
    };

    const onEvents = {
        click: (params) => {
            if (params.data && params.data[2] !== undefined) {
                const subGraph = params.data[2] + 1;
                setActiveSubgraph(subGraph.toString());
            }
        },
    };

    const renderScatterPlot = () => {
        const plotData = getScatterPlotData();
        return <ScatterPlot plotData={plotData} styles={{ minHeight: 500 }} onEvents={onEvents} />;
    };

    const shouldRenderPlaceholder = (isError, isFetching, data) => {
        return isError || isFetching || !data || data.length === 0;
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {resultData && resultData.length > 1000 ? (
                <Box
                    sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100%', mb: 2 }}
                >
                    <Typography variant='h6'>Dataset is too large. Displaying components of subsample. </Typography>
                    <Button
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setRandomized(randomized + 1);
                        }}
                    >
                        Shuffle
                    </Button>
                </Box>
            ) : null}
            {shouldRenderPlaceholder(resultError, resultIsFetching, resultData) ? (
                renderPlaceholder()
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                    }}
                >
                    <Box sx={{ flex: 1, width: '100%' }}>
                        {renderDropdown()}
                        {renderNetworkFigure()}
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                        {renderScatterPlot()}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(ViromeLayout);
