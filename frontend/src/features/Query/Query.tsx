import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from '../Explore/constants.ts';
import { useGetCountQuery, useGetRunsQuery } from '../../api/client.ts';
import { addFilter, selectAllFilters } from './slice.ts';
import { getFilterQuery } from '../../common/utils/filters.ts';

import SearchBar from '../../common/SearchBar.tsx';
import VirtualizedTable from '../../common/VirtualizedTable.tsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import PlotIcon from '@mui/icons-material/InsertChart';
import SearchIcon from '@mui/icons-material/Search';

const Query = () => {
    const dispatch = useDispatch();
    const [showSearchBar, setShowSearchBar] = useState(false);
    const activeModule = useSelector(selectActiveModule);
    const filters = useSelector(selectAllFilters);

    const {
        data: countData,
        error: countError,
        isLoading: countIsLoading,
    } = useGetCountQuery({
        filters: getFilterQuery({ filters, excludeType: activeModule }),
        groupBy: moduleConfig[activeModule].groupByKey,
        sortByColumn: 'count',
        sortByDirection: 'desc',
        pageStart: 0,
    });

    const {
        data: runData,
        error: runError,
        isLoading: runIsLoading,
    } = useGetRunsQuery({
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

    const onSearchIconClick = () => {
        setShowSearchBar(!showSearchBar);
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
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={() => onSearchIconClick()}>
                        <SearchIcon fontSize='small' />
                    </IconButton>
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={() => onPlotIconClick()}>
                        <PlotIcon fontSize='small' />
                    </IconButton>
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ width: 800 }}>
                {showSearchBar ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            width: '100%',
                            justifySelf: 'flex-end',
                        }}
                    >
                        <Box sx={{ width: '50%' }}>
                            <SearchBar />
                        </Box>
                    </Box>
                ) : null}
                <Box>
                    {countIsLoading || !countData ? (
                        <Skeleton variant='rounded' height={400} />
                    ) : (
                        <VirtualizedTable rows={countData} onRowClick={onRowClick} />
                    )}
                </Box>
                <Box sx={{ mt: 4 }}>
                    {runIsLoading || countIsLoading || !runData || !countData ? (
                        <Skeleton variant='rounded' height={20} />
                    ) : (
                        <Typography component={'div'} variant='h6' sx={{ mt: 2, textAlign: 'left' }}>
                            {`Unique ${moduleConfig[activeModule].tag}: ${countData.length}, Total matches: ${runData.length} `}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Query;
