import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCountsQuery, useGetResultQuery, useGetIdentifiersQuery } from '../../api/client.ts';
import { setActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from './constants.ts';
import { selectAllFilters } from '../Query/slice.ts';
import { getFilterQuery, handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';
import { transformRowsToPlotData } from '../../common/utils/plotHelpers.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/Toc';
import PlotIcon from '@mui/icons-material/InsertChart';
import TuneIcon from '@mui/icons-material/Tune';
import Skeleton from '@mui/material/Skeleton';
import PagedTable from '../../common/PagedTable.tsx';
import BarPlot from '../../common/BarPlot.tsx';

const Module = ({ domRef, sectionKey }) => {
    const dispatch = useDispatch();
    const [moduleDisplay, setModuleDisplay] = useState(moduleConfig[sectionKey].defaultDisplay);
    const filters = useSelector(selectAllFilters);

    const isTableView = () => moduleDisplay === 'table';
    const isPlotView = () => moduleDisplay === 'plot';

    const {
        data: runData,
        error: runError,
        isFetching: runFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: moduleConfig[sectionKey].resultsIdColumn,
            ids: runData ? runData[handleIdKeyIrregularities(moduleConfig[sectionKey].resultsIdColumn)].single : [],
            idRanges: runData ? runData[handleIdKeyIrregularities(moduleConfig[sectionKey].resultsIdColumn)].range : [],
            table: moduleConfig[sectionKey].resultsTable,
            sortByColumn: moduleConfig[sectionKey].resultsIdColumn,
            sortByDirection: 'asc',
            pageStart: 0,
            pageEnd: 10,
        },
        {
            skip: runFetching || !isTableView(),
        },
    );

    const {
        data: countData,
        error: countError,
        isFetching: countIsFetching,
    } = useGetCountsQuery(
        {
            filters: getFilterQuery({ filters, excludeType: sectionKey }),
            groupBy: moduleConfig[sectionKey].groupByKey,
            sortByColumn: 'count',
            sortByDirection: 'desc',
            pageStart: 0,
        },
        {
            skip: runFetching || !isPlotView(),
        },
    );

    const {
        data: controlCountData,
        error: controlCountError,
        isFetching: controlCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: 'bioproject',
            ids: runData ? runData['bioproject'].single : [],
            idRanges: runData ? runData['bioproject'].range : [],
            groupBy: moduleConfig[sectionKey].groupByKey,
            sortByColumn: 'count',
            sortByDirection: 'desc',
            pageStart: 0,
        },
        {
            skip: runFetching || !isPlotView(),
        },
    );

    const handleFilterClick = (sectionKey) => {
        dispatch(setActiveModule(sectionKey));
        dispatch(setActiveView('query'));
    };

    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    const shouldRenderPlaceholder = (
        resultData,
        resultError,
        resultIsFetching,
        countData,
        countError,
        countIsFetching,
        controlCountData,
        controlCountError,
        controlCountIsFetching,
    ) => {
        return (
            (isTableView() && (resultError || !resultData || resultIsFetching)) ||
            (isPlotView() &&
                (countError ||
                    controlCountError ||
                    (!countData && !controlCountData) ||
                    (countIsFetching && controlCountIsFetching)))
        );
    };

    const renderPlaceholder = (
        resultData,
        resultError,
        resultIsFetching,
        countData,
        countError,
        countIsFetching,
        controlCountData,
        controlCountError,
        controlCountIsFetching,
    ) => {
        if ((isTableView() && resultError) || (isPlotView() && (countError || controlCountData))) {
            return (
                <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        Error loading data
                    </Typography>
                </Box>
            );
        }
        if (
            (isTableView() && resultData && resultData.length === 0 && !resultIsFetching) ||
            (isPlotView() &&
                countData &&
                countData.length === 0 &&
                !countIsFetching &&
                controlCountData &&
                controlCountData.length === 0 &&
                !controlCountIsFetching)
        ) {
            return (
                <Box sx={{ flex: 1, height: 100 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        {`No ${moduleConfig[sectionKey].title.toLowerCase()} data available`}
                    </Typography>
                </Box>
            );
        }
        return (
            <Box sx={{ flex: 1 }}>
                <Skeleton width='90%' height={300} />
            </Box>
        );
    };

    const renderResultsView = (resultData, countData, controlCountData) => {
        if (isTableView() && resultData && resultData.length > 0) {
            return <PagedTable rows={resultData} headers={getHeaders(resultData)} />;
        }
        const plotData = transformRowsToPlotData(countData, controlCountData);
        return <BarPlot plotData={plotData} />;
    };

    const getHeaders = (data) => {
        if (data && data.length) {
            return Object.keys(data[0]);
        }
        return [];
    };

    const onViewChange = (view) => {
        setModuleDisplay(view);
    };

    return (
        <Box
            sx={{
                maxWidth: 490,
                flex: 1,
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component={'div'} ref={domRef} variant='h6' sx={{ ...sectionStyle, mr: 2 }}>
                    {moduleConfig[sectionKey].title}
                </Typography>
                <Box>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isPlotView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('plot')}
                    >
                        <PlotIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isTableView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('table')}
                    >
                        <TableIcon fontSize='small' />
                    </IconButton>
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={() => handleFilterClick(sectionKey)}>
                        <TuneIcon fontSize='small' />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ minWidth: 400 }}>
                {shouldRenderPlaceholder(
                    resultData,
                    resultError,
                    resultIsFetching,
                    countData,
                    countError,
                    countIsFetching,
                    controlCountData,
                    controlCountError,
                    controlCountIsFetching,
                )
                    ? renderPlaceholder(
                          resultData,
                          resultError,
                          resultIsFetching,
                          countData,
                          countError,
                          countIsFetching,
                          controlCountData,
                          controlCountError,
                          controlCountIsFetching,
                      )
                    : renderResultsView(resultData, countData, controlCountData)}
            </Box>
        </Box>
    );
};

export default Module;
