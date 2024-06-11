import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetResultQuery, useGetRunsQuery } from '../../api/client.ts';
import { setActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from './constants.ts';
import { selectAllFilters } from '../Query/slice.ts';
import { getFilterQuery } from '../../common/utils/filters.ts';
import { handleIdKeyIrregularities } from '../../common/utils/filters.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/Toc';
import PlotIcon from '@mui/icons-material/InsertChart';
import TuneIcon from '@mui/icons-material/Tune';
import Skeleton from '@mui/material/Skeleton';
import PagedTable from '../../common/PagedTable.tsx';

const Module = ({ domRef, sectionKey }) => {
    const dispatch = useDispatch();
    const [moduleView, setModuleView] = useState('table');
    const filters = useSelector(selectAllFilters);

    const {
        data: runData,
        error: runError,
        isLoading: runIsLoading,
    } = useGetRunsQuery({
        filters: getFilterQuery({ filters }),
    });
    console.log(runData ? runData.length : '');

    const {
        data: resultData,
        error: resultError,
        isLoading: resultIsLoading,
    } = useGetResultQuery(
        {
            idColumn: moduleConfig[sectionKey].resultsIdColumn,
            ids: runData
                ? runData.map((run) => run[handleIdKeyIrregularities(moduleConfig[sectionKey].resultsIdColumn)])
                : [],
            table: moduleConfig[sectionKey].resultsTable,
            sortByColumn: moduleConfig[sectionKey].resultsIdColumn,
            sortByDirection: 'asc',
            pageStart: 0,
            pageEnd: 10,
        },
        {
            skip: runIsLoading,
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

    const getPlaceholder = () => {
        return (
            <Box sx={{ flex: 1 }}>
                <Skeleton width='90%' height={300} />
            </Box>
        );
    };

    const getHeaders = (data) => {
        if (data && data.length) {
            return Object.keys(data[0]);
        }
        return [];
    };

    const handleViewChange = (view) => {
        setModuleView(view);
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
                        color={moduleView === 'plot' ? 'primary' : 'default'}
                        onClick={() => handleViewChange('plot')}
                    >
                        <PlotIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={moduleView === 'table' ? 'primary' : 'default'}
                        onClick={() => handleViewChange('table')}
                    >
                        <TableIcon fontSize='small' />
                    </IconButton>
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={() => handleFilterClick(sectionKey)}>
                        <TuneIcon fontSize='small' />
                    </IconButton>
                </Box>
            </Box>
            {resultIsLoading ? getPlaceholder() : <PagedTable rows={resultData} headers={getHeaders(resultData)} />}
        </Box>
    );
};

export default Module;
