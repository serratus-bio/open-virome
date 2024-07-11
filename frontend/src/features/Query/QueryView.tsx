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

    const stringSearch = (rows = []) => {
        const searchStrings = searchString
            .split(/[,\s]/)
            .map((substring) => substring.trim())
            .filter(Boolean);
        return rows
            .filter((row) => !!row.name)
            .filter((row) =>
                searchStrings.some((searchString) => row.name.toLowerCase().includes(searchString.toLowerCase())),
            )
            .sort((a, b) => {
                const aMatches = searchStrings.filter((searchString) =>
                    a.name.toLowerCase().includes(searchString.toLowerCase()),
                ).length;
                const bMatches = searchStrings.filter((searchString) =>
                    b.name.toLowerCase().includes(searchString.toLowerCase()),
                ).length;
                return bMatches - aMatches;
            });
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
        return stringSearch(rows);
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
            </Box>
            <Box sx={{ width: 1000 }}>
                <Box>
                    {countIsFetching || !countData ? (
                        <Skeleton variant='rounded' height={400} />
                    ) : (
                        <VirtualizedTable
                            rows={getRows(countData, searchString, moduleFilters)}
                            onRowClick={onRowClick}
                            searchBar={<SearchBar query={searchString} setQuery={setSearchString} />}
                        />
                    )}
                </Box>
                <Box sx={{ mt: 4 }}>
                    {!identifiers || identifiersFetching || countIsFetching ? (
                        <Skeleton variant='rounded' height={20} />
                    ) : (
                        <Box>
                            <Typography component={'span'} variant='h7' sx={{ mt: 2, textAlign: 'left' }}>
                                {`Total ${moduleConfig[activeModule].tag}: ${countData ? formatNumber(countData.length) : ''}.`}
                            </Typography>
                            <Typography component={'span'} variant='h7' sx={{ mt: 1, ml: 1, textAlign: 'left' }}>
                                {`${
                                    identifiers &&
                                    identifiers?.run?.totalCount >= 0 &&
                                    identifiers?.bioproject?.totalCount >= 0
                                        ? `Matching BioProjects: ${identifiers?.bioproject ? formatNumber(identifiers.bioproject.totalCount) : ''}. Matching Sequences: ${identifiers?.run ? formatNumber(identifiers.run.totalCount) : ''}.`
                                        : ''
                                }`}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default QueryView;
