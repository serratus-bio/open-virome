import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSidebarOpen, toggleSidebar } from '../../app/slice.ts';
import { selectAllFilters } from './slice.ts';
import { useGetIdentifiersQuery, useGetCountsQuery } from '../../api/client.ts';
import { getFilterQuery, handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';
import { moduleConfig } from '../Module/constants.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

const QuerySummaryText = () => {
    const dispatch = useDispatch();
    const filters = useSelector(selectAllFilters);
    const sidebarOpen = useSelector(selectSidebarOpen);

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery(
        {
            filters: getFilterQuery({ filters }),
        },
        {
            skip: sidebarOpen,
        },
    );

    const {
        data: totalVirusCountData,
        error: totalVirusCountError,
        isFetching: totalVirusCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: moduleConfig['sotu'].resultsIdColumn,
            table: moduleConfig['sotu'].resultsTable,
            ids: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig['sotu'].resultsIdColumn)].single
                : [],
            idRanges: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig['sotu'].resultsIdColumn)].range
                : [],
        },
        {
            skip: sidebarOpen || !identifiersData,
        },
    );

    const onClickFilterText = () => {
        dispatch(toggleSidebar());
    };

    const getQuerySummaryText = () => {
        if (filters.length === 0) {
            return (
                <>
                    <Typography paragraph component='span' variant='body1'>
                        {`Dataset is too large. `}
                    </Typography>
                    <Typography
                        onClick={onClickFilterText}
                        paragraph
                        variant='body1'
                        component='span'
                        color='primary'
                        style={{ cursor: 'pointer' }}
                    >
                        {`Add filters in the query builder.`}
                    </Typography>
                </>
            );
        }
        if (
            identifiersData &&
            !identifiersFetching &&
            !identifiersError &&
            totalVirusCountData &&
            !totalVirusCountIsFetching &&
            !totalVirusCountError
        ) {
            return (
                <Typography paragraph variant='body1'>
                    {`Current Query - Runs: ${formatNumber(identifiersData?.run?.totalCount)}, Bioprojects: ${formatNumber(identifiersData?.bioproject?.totalCount)}, Viruses: ${
                        totalVirusCountData?.length ? formatNumber(totalVirusCountData[0]?.count) : 0
                    }`}
                </Typography>
            );
        }
        return <Skeleton variant='text' width={400} />;
    };
    return (
        <Box
            sx={{
                width: '100%',
                mt: 1,
                ml: '10%',
            }}
        >
            {getQuerySummaryText()}
        </Box>
    );
};

export default QuerySummaryText;
