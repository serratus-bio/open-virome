import React, { useState } from 'react';
import { moduleConfig } from '../Module/constants.ts';
import { shouldDisableFigureView, getControlTargetPlotData } from '../../common/utils/plotHelpers.ts';
import { useGetCountsQuery } from '../../api/client.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import BarPlot from '../../common/BarPlot.tsx';
import PolarBarPlot from '../../common/PolarBarPlot.tsx';
import RadioButtonsGroup from '../../common/RadioButtonsGroup.tsx';

const TargetControlFigure = ({ identifiers, moduleKey, figureType }) => {
    const [activeCountKey, setActiveCountKey] = useState('count');

    const {
        data: targetCountData,
        error: targetCountError,
        isFetching: targetCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: 'run',
            ids: identifiers ? identifiers['run'].single : [],
            idRanges: identifiers ? identifiers['run'].range : [],
            groupBy: moduleConfig[moduleKey].groupByKey,
        },
        {
            skip: shouldDisableFigureView(identifiers),
        },
    );

    const {
        data: controlCountData,
        error: controlCountError,
        isFetching: controlCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: 'bioproject',
            ids: identifiers ? identifiers['bioproject'].single : [],
            idRanges: identifiers ? identifiers['bioproject'].range : [],
            groupBy: moduleConfig[moduleKey].groupByKey,
        },
        {
            skip: shouldDisableFigureView(identifiers),
        },
    );

    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    const countKeys = {
        count: 'Run Count (n)',
        gbp: 'Gigabasepairs (Gbp)',
        percent: 'Percent runs (%)',
    };

    const renderFigure = (seriesName) => {
        const plotData = getControlTargetPlotData(targetCountData, controlCountData, activeCountKey);
        let totalRuns = seriesName === 'Target' ? targetCountData : controlCountData;
        totalRuns = formatNumber(totalRuns.reduce((acc, curr) => acc + parseInt(curr.count), 0));
        const filteredPlotData = {
            ...plotData,
            legend: {
                show: false,
                selected: {
                    Target: seriesName === 'Target',
                    Control: seriesName === 'Control',
                },
                textStyle: {
                    color: 'white',
                },
            },
        };
        if (figureType === 'polar') {
            return (
                <Box sx={{ minWidth: 400 }}>
                    <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                        {`${seriesName} set (n = ${totalRuns})`}
                    </Typography>
                    <PolarBarPlot plotData={filteredPlotData} />
                </Box>
            );
        }
        if (figureType === 'bar') {
            return (
                <Box sx={{ minWidth: 400 }}>
                    <Typography variant='body2' sx={{ position: 'absolute', fontStyle: 'italic' }}>
                        {`${seriesName} set (n = ${totalRuns})`}
                    </Typography>
                    <BarPlot plotData={filteredPlotData} />
                </Box>
            );
        }
    };

    const shouldRenderPlaceholder = (isError, isFetching, data) => {
        return isError || isFetching || !data;
    };

    const renderPlaceholder = () => {
        if (targetCountError || controlCountError) {
            return (
                <Box sx={{ flex: 1 }}>
                    <Typography variant='h6' sx={{ ...sectionStyle }}>
                        Error loading data
                    </Typography>
                </Box>
            );
        }
        if (
            targetCountData &&
            targetCountData.length === 0 &&
            !targetCountIsFetching &&
            controlCountData &&
            controlCountData.length === 0 &&
            !controlCountIsFetching
        ) {
            return (
                <Box sx={{ flex: 1, height: 100 }}>
                    <Typography variant='h6' sx={{ ...sectionStyle }}>
                        {`No ${moduleConfig[moduleKey].title.toLowerCase()} data available`}
                    </Typography>
                </Box>
            );
        }
        return (
            <Box sx={{ flex: 1, width: 400 }}>
                <Skeleton width='90%' height={300} />
            </Box>
        );
    };

    const onCountChange = (event) => {
        setActiveCountKey(event.target.value);
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Typography component={'div'} variant='h6' sx={{ ...sectionStyle, mr: 2 }}>
                    {moduleConfig[moduleKey].title}
                </Typography>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {shouldRenderPlaceholder(controlCountError, controlCountIsFetching, controlCountData) ? (
                    renderPlaceholder()
                ) : (
                    <Box sx={{ flex: 1, width: 400 }}>{renderFigure('Control')}</Box>
                )}
                {shouldRenderPlaceholder(targetCountError, targetCountIsFetching, targetCountData) ? (
                    renderPlaceholder()
                ) : (
                    <Box sx={{ flex: 1, width: 400 }}>{renderFigure('Target')}</Box>
                )}
                <RadioButtonsGroup items={countKeys} selected={activeCountKey} onChange={onCountChange} />
            </Box>
        </Box>
    );
};

export default TargetControlFigure;
