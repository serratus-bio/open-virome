import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSidebarOpen, toggleSidebar, selectActiveQueryModule } from '../../app/slice.ts';
import { moduleConfig } from '../Module/constants.ts';
import { useGetCountsQuery, useGetIdentifiersQuery } from '../../api/client.ts';
import { addFilter, removeFilter, selectAllFilters, selectFiltersByType } from './slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';

import SearchBar from '../../common/SearchBar.tsx';
import VirtualizedTable from '../../common/VirtualizedTable.tsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Modal from '@mui/material/Modal';
import Slide from '@mui/material/Slide';

const QueryView = () => {
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState('');
    const activeModule = useSelector(selectActiveQueryModule);
    const filters = useSelector(selectAllFilters);
    const moduleFilters = useSelector((state) => selectFiltersByType(state, activeModule));
    const sidebarOpen = useSelector(selectSidebarOpen);

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

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
        <Modal
            open={sidebarOpen}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClose={() => dispatch(toggleSidebar())}
            closeAfterTransition={false}
        >
            <Box>
                <Slide direction='right' in={sidebarOpen} mountOnEnter unmountOnExit>
                    <Box
                        sx={{
                            width: 700,
                            height: '100%',
                            position: 'absolute',
                            top: 60,
                            left: 240,
                            backgroundColor: '#252427',
                        }}
                    >
                        <Box>
                            {countIsFetching || !countData ? (
                                <Skeleton variant='rounded' height={'70vh'} />
                            ) : (
                                <VirtualizedTable
                                    rows={getRows(countData, searchString, moduleFilters)}
                                    onRowClick={onRowClick}
                                    searchBar={
                                        <SearchBar
                                            placeholder={`Search ${moduleConfig[activeModule].title.toLowerCase()}`}
                                            query={searchString}
                                            setQuery={setSearchString}
                                        />
                                    }
                                />
                            )}
                        </Box>
                        <Box sx={{ mb: 2, mt: 4, ml: 2 }}>
                            {!identifiersData || identifiersFetching || countIsFetching ? (
                                <Skeleton variant='rounded' height={20} width={'80%'} />
                            ) : (
                                <Box>
                                    <Typography component={'span'} variant='body2' sx={{ textAlign: 'left' }}>
                                        {`Total rows: ${countData ? formatNumber(countData.length) : ''}.`}
                                    </Typography>
                                    <Typography component={'span'} variant='body2' sx={{ mt: 1, textAlign: 'left' }}>
                                        {`${
                                            identifiersData &&
                                            identifiersData?.run?.totalCount >= 0 &&
                                            identifiersData?.bioproject?.totalCount >= 0
                                                ? ` Matching BioProjects: ${identifiersData?.bioproject ? formatNumber(identifiersData.bioproject.totalCount) : ''}. Matching Sequences: ${identifiersData?.run ? formatNumber(identifiersData.run.totalCount) : ''}.`
                                                : ''
                                        }`}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Slide>
            </Box>
        </Modal>
    );
};

export default QueryView;
