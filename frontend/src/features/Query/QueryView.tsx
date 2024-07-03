import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from '../Explore/Module/constants.ts';
import { useGetCountsQuery, useGetIdentifiersQuery } from '../../api/client.ts';
import { addFilter, removeFilter, selectAllFilters, selectFiltersByType } from './slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';

import SearchBar from '../../common/SearchBar.tsx';
import VirtualizedTable from '../../common/VirtualizedTable.tsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import PlotIcon from '@mui/icons-material/Pageview';
// import PlotIcon from '@mui/icons-material/InsertChart';
// import PlotIcon from '@mui/icons-material/QueryStats';

const QueryView = () => {
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState('');
    const activeModule = useSelector(selectActiveModule);
    const filters = useSelector(selectAllFilters);
    const moduleFilters = useSelector((state) => selectFiltersByType(state, activeModule));

    const {
        data: countData,
        error: countError,
        isFetching: countIsFetching,
    } = useGetCountsQuery({
        filters: getFilterQuery({ filters, excludeType: activeModule }),
        groupBy: moduleConfig[activeModule].groupByKey,
    });

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersIsFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    useEffect(() => {
        setSearchString('');
    }, [activeModule]);

    const onRowClick = (row) => {
        if (row.selected) {
            dispatch(removeFilter(`${activeModule}-${row.name}`));
            return;
        } else {
            dispatch(
                addFilter({
                    filterId: `${activeModule}-${row.name}`,
                    filterType: activeModule,
                    filterValue: row.name,
                }),
            );
        }
    };

    const onPlotIconClick = () => {
        dispatch(setActiveView('explore'));
    };

    const getRows = (countData, searchString, moduleFilters) => {
        const addFilterState = (rows) => {
            return rows.map((row) => {
                const filterState = moduleFilters.find((filter) => filter.filterValue === row.name);
                return {
                    ...row,
                    selected: !!filterState,
                };
            });
        };

        if (!countData) {
            return [];
        }

        let rows = addFilterState(countData);
        if (!searchString) {
            return rows;
        }
        return rows.filter((row) => row?.name && row.name.toLowerCase().includes(searchString.toLowerCase()));
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
                    <IconButton sx={{ mt: -1 }} onClick={() => {}}>
                        <TuneIcon fontSize='medium' color={'primary'} />
                    </IconButton>
                    <IconButton sx={{ mt: -1 }} onClick={() => onPlotIconClick()}>
                        <PlotIcon fontSize='medium' />
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
                        <VirtualizedTable
                            rows={getRows(countData, searchString, moduleFilters)}
                            onRowClick={onRowClick}
                        />
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
