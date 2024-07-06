import React, { useState } from 'react';
import { moduleConfig } from './constants.ts';
import { handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';

import PagedTable from '../../common/PagedTable.tsx';
import { useGetResultQuery, useGetCountsQuery } from '../../api/client.ts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

const ResultsTable = ({ identifiersData, moduleKey, shouldSkipFetching }) => {
    const [page, setPage] = useState(0);

    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: moduleConfig[moduleKey].resultsIdColumn,
            ids: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig[moduleKey].resultsIdColumn)].single
                : [],
            idRanges: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig[moduleKey].resultsIdColumn)].range
                : [],
            table: moduleConfig[moduleKey].resultsTable,
            sortByColumn: moduleConfig[moduleKey].resultsIdColumn,
            sortByDirection: 'asc',
            pageStart: page * 10,
            pageEnd: (page + 1) * 10,
        },
        {
            skip: shouldSkipFetching,
        },
    );

    const {
        data: totalCount,
        error: totalCountError,
        isFetching: totalCountIsFetching,
    } = useGetCountsQuery(
        {
            idColumn: moduleConfig[moduleKey].resultsIdColumn,
            table: moduleConfig[moduleKey].resultsTable,
            ids: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig[moduleKey].resultsIdColumn)].single
                : [],
            idRanges: identifiersData
                ? identifiersData[handleIdKeyIrregularities(moduleConfig[moduleKey].resultsIdColumn)].range
                : [],
        },
        {
            skip: shouldSkipFetching,
        },
    );

    const onPageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
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
                    <Typography variant='h6' sx={{ ...sectionStyle }}>
                        Error loading data
                    </Typography>
                </Box>
            );
        }
        if (resultData && resultData.length === 0 && !resultIsFetching) {
            return (
                <Box sx={{ flex: 1, height: 100 }}>
                    <Typography variant='h6' sx={{ ...sectionStyle }}>
                        {`No data available`}
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

    return (
        <>
            {shouldRenderPlaceholder() ? (
                renderPlaceholder()
            ) : (
                <PagedTable
                    page={page}
                    onPageChange={onPageChange}
                    total={totalCount?.length ? totalCount[0]?.count : 0}
                    rows={resultData}
                    headers={getTableHeaders(resultData)}
                />
            )}
        </>
    );
};

export default ResultsTable;
