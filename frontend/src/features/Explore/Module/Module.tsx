import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllFilters } from '../../Query/slice.ts';
import { sectionConfig } from './constants.ts';
import { getFilterQuery } from '../../../common/utils/queryHelpers.ts';
import { useGetIdentifiersQuery } from '../../../api/client.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SRARunLayout from './SRARunLayout.tsx';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/TableRows';
import PlotIcon from '@mui/icons-material/InsertChart';
import ResultsTable from './ResultsTable.tsx';

const Module = ({ sectionKey }) => {
    const filters = useSelector(selectAllFilters);

    const [moduleDisplay, setModuleDisplay] = useState(sectionConfig[sectionKey].defaultDisplay);
    const isTableView = () => moduleDisplay === 'table';
    const isFigureView = () => moduleDisplay === 'figure';

    const shouldDisableFigureView = () => {
        return filters.length === 0 || (identifiersData && identifiersData['run'].totalCount > 10000);
    };

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    useEffect(() => {
        if (shouldDisableFigureView()) {
            setModuleDisplay('table');
        }
    }, [identifiersData]);

    const onViewChange = (view) => {
        setModuleDisplay(view);
    };


    const getModuleFigureLayout = (sectionKey) => {
        if (sectionKey === 'SRA Run') {
            return <SRARunLayout identifiers={identifiersData} />;
        }
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
                        <PlotIcon fontSize='medium' />
                    </IconButton>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isTableView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('table')}
                    >
                        <TableIcon fontSize='medium' />
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
                        <ResultsTable
                            identifiersData={identifiersData}
                            sectionKey={sectionKey}
                            shouldSkipFetching={identifiersFetching || !isTableView()}
                        />

                ) : (
                    getModuleFigureLayout(sectionKey)
                )}
            </Box>
        </Box>
    );
};

export default Module;
