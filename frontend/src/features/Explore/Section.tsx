import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllFilters } from '../Query/slice.ts';
import { sectionConfig } from './constants.ts';
import { getFilterQuery, handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';
import { useGetResultQuery, useGetIdentifiersQuery } from '../../api/client.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Module from './Module.tsx';
import PagedTable from '../../common/PagedTable.tsx';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/Toc';
import PlotIcon from '@mui/icons-material/InsertChart';
import Skeleton from '@mui/material/Skeleton';

const Section = ({ sectionKey }) => {
    const filters = useSelector(selectAllFilters);

    const [moduleDisplay, setModuleDisplay] = useState('table');
    const isTableView = () => moduleDisplay === 'table';
    const isFigureView = () => moduleDisplay === 'figure';

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: sectionConfig[sectionKey].resultsIdColumn,
            ids: identifiersData
                ? identifiersData[handleIdKeyIrregularities(sectionConfig[sectionKey].resultsIdColumn)].single
                : [],
            idRanges: identifiersData
                ? identifiersData[handleIdKeyIrregularities(sectionConfig[sectionKey].resultsIdColumn)].range
                : [],
            table: sectionConfig[sectionKey].resultsTable,
            sortByColumn: sectionConfig[sectionKey].resultsIdColumn,
            sortByDirection: 'asc',
            pageStart: 0,
            pageEnd: 10,
        },
        {
            skip: identifiersFetching || !isTableView(),
        },
    );

    const onViewChange = (view) => {
        setModuleDisplay(view);
    };

    const getTableHeaders = (data) => {
        if (data && data.length) {
            return Object.keys(data[0]);
        }
        return [];
    };

    const shouldRenderPlaceholder = () => {
        return resultError || resultIsFetching || !resultData || resultData.length === 0;
    };

    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    const renderPlaceholder = () => {
        if (resultError) {
            return (
                <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        Error loading data
                    </Typography>
                </Box>
            );
        }
        if (resultData && resultData.length === 0 && !resultIsFetching) {
            return (
                <Box sx={{ flex: 1, height: 100 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        {`No ${sectionConfig[sectionKey].title.toLowerCase()} data available`}
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

    const shouldDisableFigureView = () => {
        return filters.length === 0;
    };

    return (
        <Box sx={{ maxWidth: '70vw' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component={'div'} variant='h4'>
                    {sectionKey}
                </Typography>
                <Box>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isFigureView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('figure')}
                        disabled={shouldDisableFigureView()}
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
                </Box>
            </Box>
            <Divider />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mt: 4,
                }}
            >
                {isTableView() ? (
                    shouldRenderPlaceholder() ? (
                        renderPlaceholder()
                    ) : (
                        <PagedTable rows={resultData} headers={getTableHeaders(resultData)} />
                    )
                ) : (
                    sectionConfig[sectionKey].modules.map((moduleKey) => (
                        <Box sx={{ mr: 4 }} key={moduleKey}>
                            <Module identifiers={identifiersData} moduleKey={moduleKey} />
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Section;
