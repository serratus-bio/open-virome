import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from '../Explore/constants.ts';
import { useGetCountsQuery, useGetIdentifiersQuery } from '../../api/client.ts';
import { addFilter, selectAllFilters } from './slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';

import SearchBar from '../../common/SearchBar.tsx';
import VirtualizedTable from '../../common/VirtualizedTable.tsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import PlotIcon from '@mui/icons-material/InsertChart';
import TuneIcon from '@mui/icons-material/Tune';

const QueryView = () => {
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState('');
    const activeModule = useSelector(selectActiveModule);
    const filters = useSelector(selectAllFilters);

    const {
        data: countData,
        error: countError,
        isFetching: countIsFetching,
    } = useGetCountsQuery({
        filters: getFilterQuery({ filters, excludeType: activeModule }),
        groupBy: moduleConfig[activeModule].groupByKey,
        sortByColumn: 'count',
        sortByDirection: 'desc',
        pageStart: 0,
    });

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersIsFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    const onRowClick = (row) => {
        const filter = {
            filterId: `${activeModule}-${row.name}`,
            filterType: activeModule,
            filterValue: row.name,
        };
        dispatch(addFilter(filter));
    };

    const onPlotIconClick = () => {
        dispatch(setActiveView('explore'));
    };

    const getFilteredCounts = (countData) => {
        if (!countData) {
            return [];
        }
        if (!searchString) {
            return countData;
        }
        return countData.filter((row) => row.name.toLowerCase().includes(searchString.toLowerCase()));
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 800,
                }}
            >
                <Typography component={'div'} variant='h4' sx={{ mt: 2, mb: 2, mr: 8 }}>
                    {moduleConfig[activeModule].title}
                </Typography>
                <Box>
                    <IconButton sx={{ mt: -1 }} onClick={() => onPlotIconClick()}>
                        <PlotIcon fontSize='medium' />
                    </IconButton>
                    <IconButton sx={{ mt: -1 }} onClick={() => {}}>
                        <TuneIcon fontSize='medium' color={'primary'} />
                    </IconButton>
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ width: 800 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        justifySelf: 'flex-end',
                        mb: 1,
                    }}
                >
                    <Box sx={{ width: '50%', mr: 8 }}>
                        <SearchBar query={searchString} setQuery={setSearchString} />
                    </Box>
                </Box>
                <Box>
                    {countIsFetching || !countData ? (
                        <Skeleton variant='rounded' height={400} />
                    ) : (
                        <VirtualizedTable rows={getFilteredCounts(countData)} onRowClick={onRowClick} />
                    )}
                </Box>
                <Box sx={{ mt: 4 }}>
                    {identifiersIsFetching || countIsFetching ? (
                        <Skeleton variant='rounded' height={20} />
                    ) : (
                        <Typography component={'div'} variant='h6' sx={{ mt: 2, textAlign: 'left' }}>
                            {`${moduleConfig[activeModule].tag}: ${countData ? formatNumber(countData.length) : ''}${
                                identifiersData &&
                                identifiersData?.run?.totalCount >= 0 &&
                                identifiersData?.bioproject?.totalCount >= 0
                                    ? `, Bioprojects: ${identifiersData?.bioproject ? formatNumber(identifiersData.bioproject.totalCount) : ''}, Sequences: ${identifiersData?.run ? formatNumber(identifiersData.run.totalCount) : ''}`
                                    : ''
                            }`}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default QueryView;
