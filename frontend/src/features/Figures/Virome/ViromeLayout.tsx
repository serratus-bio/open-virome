import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModuleBySection } from '../../../app/slice.ts';
import { isSummaryView } from '../../../common/utils/plotHelpers.ts';
import { getViromeGraphData } from './plotHelpers.ts';
import { useGetResultQuery } from '../../../api/client.ts';
import { moduleConfig } from '../../Module/constants.ts';
import { handleIdKeyIrregularities } from '../../../common/utils/queryHelpers.ts';
import cytoscape from 'cytoscape';

import NetworkPlot from '../../../common/NetworkPlot.tsx';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import DropDownSelect from '../../../common/DropdownSelect.tsx';
import ScatterPlot from '../../../common/ScatterPlot.tsx';
import ViromeSummaryTable from './ViromeSummaryTable.tsx';

const ViromeLayout = ({ identifiers }) => {
    const activeModule = useSelector((state) => selectActiveModuleBySection(state, 'palmdb'));
    const [randomized, setRandomized] = useState(0);
    const [activeSubgraph, setActiveSubgraph] = useState('1');
    const [isSummaryTableOpen, setIsSummaryTableOpen] = useState(false);
    const [selectedNetworkItem, setSelectedNetworkItem] = useState(null);
    const [headlessCy, setHeadlessCy] = useState(
        cytoscape({
            headless: true,
            elements: [],
        }),
    );
    const containerRef = React.useRef(null);

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
            pageEnd: isSummaryView(identifiers) ? 100 : undefined,
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

    useEffect(() => {
        setIsSummaryTableOpen(false);
    }, [activeModule, identifiers]);

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
                    <Skeleton variant='rectangular' width={'50%'} height={'70vh'} sx={{ mr: 4 }} />
                    <Skeleton variant='rectangular' width={'50%'} height={'70vh'} />
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
            <Box>
                <DropDownSelect
                    options={getComponentOptions()}
                    activeOption={activeSubgraph}
                    label='Virome Component'
                    setActiveOption={(event) => {
                        setActiveSubgraph(event.target.value);
                    }}
                    styles={{ width: 150 }}
                />
            </Box>
        );
    };

    const onNetworkPlotClick = useCallback((data) => {
        setIsSummaryTableOpen(true);
        setSelectedNetworkItem(data);
    }, []);

    const plotData = useMemo(() => getNetworkPlotData(), [activeSubgraph, randomized]);

    const renderNetworkFigure = () => {
        return (
            <Box ref={containerRef}>
                <NetworkPlot plotData={plotData} onNodeClick={onNetworkPlotClick} onEdgeClick={onNetworkPlotClick} />
            </Box>
        );
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

        return {
            // Scatter Plot Settings - Virome Component
            color: '#4CB9F1',
            xAxis: {
                type: 'value',
                name: 'Nodes # (Virus + Run)',
                nameLocation: 'middle',
                nameGap: 30,
            },
            yAxis: {
                type: 'value',
                name: 'Edges # (contigs)',
                nameLocation: 'middle',
                nameGap: 35,
            },
            grid: {
                left: '6%',
                right: '6%',
                bottom: '6%',
                containLabel: true,
                borderColor: 'white',
            },
            title: {
                show: true,
                text: '   Virome Component Summary',
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
                },
            ],
        };
    };

    const onScatterPlotEvents = {
        click: (params) => {
            if (params.data && params.data[2] !== undefined) {
                const subGraph = params.data[2] + 1;
                setActiveSubgraph(subGraph.toString());
            }
        },
    };

    const renderScatterPlot = () => {
        const plotData = getScatterPlotData();
        return <ScatterPlot plotData={plotData} styles={{ height: '70vh' }} onEvents={onScatterPlotEvents} />;
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
                    <Box sx={{ flex: 1, width: '100%' }}>{renderNetworkFigure()}</Box>

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                        {renderDropdown()}
                        {isSummaryTableOpen ? (
                            <ViromeSummaryTable
                                selectedItem={selectedNetworkItem}
                                onClose={() => setIsSummaryTableOpen(false)}
                                rows={resultData}
                                activeModule={activeModule}
                                maxWidth={containerRef.current.clientWidth}
                            />
                        ) : (
                            renderScatterPlot()
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(ViromeLayout);
