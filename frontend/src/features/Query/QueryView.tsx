import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveModule } from '../../app/slice.ts';
import { moduleConfig } from '../Module/constants.ts';
import { useGetCountsQuery } from '../../api/client.ts';
import { addFilter, removeFilter, selectAllFilters, selectFiltersByType } from './slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';

import SearchBar from '../../common/SearchBar.tsx';
import VirtualizedTable from '../../common/VirtualizedTable.tsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

const QueryView = ({ identifiers, identifiersFetching }) => {
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
        sortByColumn: 'count',
        sortByDirection: 'desc',
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
                    mb: 2,
                }}
            >
                <Typography component={'div'} variant='h5' sx={{ mr: 8 }}>
                    {moduleConfig[activeModule].title}
                </Typography>
                <Box sx={{ width: '50%', mr: 0 }}>
                    <SearchBar query={searchString} setQuery={setSearchString} />
                </Box>
            </Box>
            <Box sx={{ width: 1000 }}>
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
                    {!identifiers || identifiersFetching || countIsFetching ? (
                        <Skeleton variant='rounded' height={20} />
                    ) : (
                        <Typography component={'div'} variant='h6' sx={{ mt: 2, textAlign: 'left' }}>
                            {`${moduleConfig[activeModule].tag}: ${countData ? formatNumber(countData.length) : ''}${
                                identifiers &&
                                identifiers?.run?.totalCount >= 0 &&
                                identifiers?.bioproject?.totalCount >= 0
                                    ? `, Bioprojects: ${identifiers?.bioproject ? formatNumber(identifiers.bioproject.totalCount) : ''}, Sequences: ${identifiers?.run ? formatNumber(identifiers.run.totalCount) : ''}`
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
