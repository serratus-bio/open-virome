import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllFilters } from '../Query/slice.ts';
import { selectActiveSection, selectActiveModule } from '../../app/slice.ts';
import { moduleConfig } from './constants.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { shouldDisableFigureView } from '../../common/utils/plotHelpers.ts';
import { useGetIdentifiersQuery } from '../../api/client.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SRARunLayout from '../Figures/SRARunLayout.tsx';
import EnvironmentLayout from '../Figures/EnvironmentLayout.tsx';
import ViromeLayout from '../Figures/ViromeLayout.tsx';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/TableRows';
import PlotIcon from '@mui/icons-material/InsertChart';
import TuneIcon from '@mui/icons-material/Tune';
import ResultsTable from '../Results/ResultsTable.tsx';
import QueryView from '../Query/QueryView.tsx';
import Toolbar from '@mui/material/Toolbar';

const Module = () => {
    const filters = useSelector(selectAllFilters);
    const activeSection = useSelector(selectActiveSection);
    const activeModule = useSelector(selectActiveModule);

    const [moduleDisplay, setModuleDisplay] = useState(moduleConfig[activeModule]?.defaultDisplay);

    const isTableView = () => moduleDisplay === 'table';
    const isFigureView = () => moduleDisplay === 'figure';
    const isFilterView = () => moduleDisplay === 'filter';

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery({
        filters: getFilterQuery({ filters }),
    });

    useEffect(() => {
        if (shouldDisableFigureView(identifiersData, activeSection)) {
            setModuleDisplay('filter');
        }
    }, [identifiersData]);

    const onViewChange = (view) => {
        setModuleDisplay(view);
    };

    const getModuleFigureLayout = () => {
        if (activeSection === 'SRA Experiment') {
            return <SRARunLayout identifiers={identifiersData} />;
        }
        if (activeSection === 'Palmdb Virome') {
            return <ViromeLayout identifiers={identifiersData} />;
        }
        if (activeSection === 'Context' && activeModule === 'geography') {
            return <EnvironmentLayout identifiers={identifiersData} />;
        }
        return (
            <Box>
                <Typography variant='h6'>Coming soon!</Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ maxWidth: 1000, ml: 8, mt: 4, mb: 8, flexGrow: 1 }}>
            <Toolbar />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component={'div'} variant='h4'>
                    {activeSection}
                </Typography>
                <Box>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isFilterView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('filter')}
                    >
                        <TuneIcon fontSize='medium' />
                    </IconButton>
                    <IconButton
                        sx={{ mt: -0.5, height: 30, width: 30 }}
                        color={isFigureView() ? 'primary' : 'default'}
                        onClick={() => onViewChange('figure')}
                        disabled={shouldDisableFigureView(identifiersData, activeSection)}
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
                {isFilterView() ? (
                    <QueryView identifiers={identifiersData} identifiersFetching={identifiersFetching} />
                ) : isTableView() ? (
                    <ResultsTable
                        identifiers={identifiersData}
                        moduleKey={activeModule}
                        shouldSkipFetching={identifiersFetching || !isTableView()}
                    />
                ) : (
                    getModuleFigureLayout()
                )}
            </Box>
        </Box>
    );
};

export default Module;
