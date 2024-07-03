import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveModule, setActiveView } from '../../../app/slice.ts';
import {
    shouldDisableFigureView,
    getBioprojectSizePlotData,
    getBioprojectTargetPercentagePlotData,
    getBioprojectSizeVsPercentagePlotData,
} from '../../../common/utils/plotHelpers.ts';
import { useGetCountsQuery } from '../../../api/client.ts';
import { moduleConfig } from './constants.ts';

import HistogramPlot from '../../../common/HistogramPlot.tsx';
import ScatterPlot from '../../../common/ScatterPlot.tsx';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';

const BioprojectFigure = ({ identifiers }) => {
    const dispatch = useDispatch();

    const {
        data: targetCountData,
        error: targetCountError,
        isFetching: targetCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: 'run',
            ids: identifiers ? identifiers['run'].single : [],
            idRanges: identifiers ? identifiers['run'].range : [],
            groupBy: moduleConfig['bioproject'].groupByKey,
            sortByColumn: 'count',
            sortByDirection: 'desc',
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
            groupBy: moduleConfig['bioproject'].groupByKey,
            sortByColumn: 'count',
            sortByDirection: 'desc',
        },
        {
            skip: shouldDisableFigureView(identifiers),
        },
    );

    const shouldRenderPlaceholder = (isError, isFetching, data) => {
        return isError || isFetching || !data;
    };

    const renderTotalSizePlot = () => {
        return (
            <Box sx={{ flex: 1, width: 350 }}>
                <HistogramPlot plotData={getBioprojectSizePlotData(controlCountData)} />
            </Box>
        );
    };

    const renderTargetPercentagePlot = () => {
        return (
            <Box sx={{ flex: 1, width: 350 }}>
                <HistogramPlot plotData={getBioprojectTargetPercentagePlotData(controlCountData, targetCountData)} />
            </Box>
        );
    };

    const renderSizeVsPercentagePlot = () => {
        return (
            <Box sx={{ flex: 1, width: '100%', height: '100%' }}>
                <ScatterPlot
                    plotData={getBioprojectSizeVsPercentagePlotData(controlCountData, targetCountData)}
                    styles={{ height: 600 }}
                />
            </Box>
        );
    };

    const handleFilterClick = () => {
        dispatch(setActiveModule('bioproject'));
        dispatch(setActiveView('query'));
    };
    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Typography component={'div'} variant='h6' sx={{ ...sectionStyle, mr: 2 }}>
                    {moduleConfig['bioproject'].title}
                </Typography>
                <Box>
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={handleFilterClick}>
                        <TuneIcon fontSize='small' />
                    </IconButton>
                </Box>
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
                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {shouldRenderPlaceholder(controlCountError, controlCountIsFetching, controlCountData) ? (
                        <Skeleton variant='rectangular' width={300} height={265} sx={{ mb: 8 }} />
                    ) : (
                        renderTotalSizePlot()
                    )}
                    {shouldRenderPlaceholder(controlCountError, controlCountIsFetching, controlCountData) ||
                    shouldRenderPlaceholder(targetCountError, targetCountIsFetching, targetCountData) ? (
                        <Skeleton variant='rectangular' width={300} height={265} />
                    ) : (
                        renderTargetPercentagePlot()
                    )}
                </Box>

                <Box sx={{ flex: 1.5 }}>
                    {shouldRenderPlaceholder(controlCountError, controlCountIsFetching, controlCountData) ||
                    shouldRenderPlaceholder(targetCountError, targetCountIsFetching, targetCountData) ? (
                        <Skeleton variant='rectangular' width={600} height={600} />
                    ) : (
                        renderSizeVsPercentagePlot()
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default BioprojectFigure;
