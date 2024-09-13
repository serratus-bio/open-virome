import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllFilters } from '../Query/slice.ts';
import { selectActiveModuleBySection, setActiveModule, selectSidebarOpen } from '../../app/slice.ts';
import { sectionConfig, moduleConfig } from './constants.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { shouldDisableFigureView } from '../../common/utils/plotHelpers.ts';
import { useGetIdentifiersQuery } from '../../api/client.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SRARunLayout from '../Figures/SRARun/SRARunLayout.tsx';
import EnvironmentLayout from '../Figures/EnvironmentLayout.tsx';
import ViromeLayout from '../Figures/Virome/ViromeLayout.tsx';
import IconButton from '@mui/material/IconButton';
import TableIcon from '@mui/icons-material/TableRows';
import PlotIcon from '@mui/icons-material/InsertChart';
import ResultsTable from '../Results/ResultsTable.tsx';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import QuestionMarkIcon from '@mui/icons-material/HelpCenter';

const Module = ({ sectionKey }) => {
    const dispatch = useDispatch();
    const filters = useSelector(selectAllFilters);
    const activeModule = useSelector((state) => selectActiveModuleBySection(state, sectionKey));
    const sidebarOpen = useSelector(selectSidebarOpen);
    const [moduleDisplay, setModuleDisplay] = useState(moduleConfig[activeModule].defaultDisplay);

    const isTableView = () => moduleDisplay === 'table';
    const isFigureView = () => moduleDisplay === 'figure';

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery(
        {
            filters: getFilterQuery({ filters }),
        },
        {
            skip: sidebarOpen,
        },
    );

    useEffect(() => {
        if (!identifiersFetching && shouldDisableFigureView(identifiersData, sectionKey)) {
            setModuleDisplay('table');
        } else {
            setModuleDisplay(moduleConfig[activeModule].defaultDisplay);
        }
    }, [identifiersData]);

    const onViewChange = (view) => {
        setModuleDisplay(view);
    };

    const getModuleFigureLayout = () => {
        if (!identifiersData || identifiersFetching) {
            return (
                <Box sx={{ height: '70vh', width: '100%' }}>
                    <Skeleton variant='rectangular' width={'100%'} height={'100%'} />
                </Box>
            );
        }
        /*
         * X
         */
        if (sectionKey === 'sra') {
            return <SRARunLayout identifiers={identifiersData} activeModule={activeModule} />;
        }
        if (sectionKey === 'palmdb') {
            return <ViromeLayout identifiers={identifiersData} />;
        }
        if (sectionKey === 'context' && activeModule === 'geography_simple') {
            return <EnvironmentLayout identifiers={identifiersData} layout='simple' />;
        }
        if (sectionKey === 'context' && activeModule === 'geography_advanced') {
            return <EnvironmentLayout identifiers={identifiersData} layout='advanced' />;
        }
        return (
            <Box sx={{ height: 400, width: 400 }}>
                <Typography variant='h6'>Coming soon!</Typography>
            </Box>
        );
    };

    const onModuleChange = (event) => {
        dispatch(setActiveModule({ sectionKey, moduleKey: event.target.value }));
    };

    const onHelpClick = () => {
        window.open(sectionConfig[sectionKey]?.wikiUrl, '_blank');
    };

    return (
        /* Section Layout */
        /* Control Global Figure width on page here " */
        <Box sx={{ width: '88vw', maxWidth: '100%', mt: 1, mb: 4, flexGrow: 1 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ mb: 0 }}>
                        {' '}
                        {/* Pull-down Menu Module Select */}
                        <Select
                            sx={{
                                'backgroundColor': '#28282800',
                                'fontSize': 26,
                                '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#40a9ff',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#40a9ff',
                                    borderWidth: '0.15rem',
                                },
                                'borderColor': '#40a9ff',
                                '&:before': {
                                    borderColor: '#40a9ff',
                                },
                                '&:after': {
                                    borderColor: '#40a9ff',
                                },
                            }}
                            value={activeModule}
                            onChange={onModuleChange}
                            variant='standard'
                        >
                            {sectionConfig[sectionKey]?.modules.map((module) => (
                                <MenuItem key={module} value={module} sx={{ pr: 10 }}>
                                    {moduleConfig[module]?.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>

                <Box>
                    View:
                    <Tooltip
                        placement='top'
                        title={
                            shouldDisableFigureView(identifiersData, sectionKey)
                                ? 'Figure view disabled. Add more filters.'
                                : 'Figures'
                        }
                    >
                        {/* Module View Icons */}
                        <IconButton
                            sx={{ mt: -0.5, height: 10, width: 30 }}
                            color={isFigureView() ? 'primary' : 'default'}
                            onClick={() => onViewChange('figure')}
                            disabled={shouldDisableFigureView(identifiersData, sectionKey)}
                        >
                            <PlotIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Table' placement='top'>
                        <IconButton
                            sx={{ mt: -0.5, height: 10, width: 30 }}
                            color={isTableView() ? 'primary' : 'default'}
                            onClick={() => onViewChange('table')}
                        >
                            <TableIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Wiki' placement='top'>
                        <IconButton sx={{ mt: -0.5, height: 10, width: 30 }} onClick={onHelpClick}>
                            <QuestionMarkIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    mt: 1,
                }}
            >
                {isTableView() ? (
                    <ResultsTable
                        identifiers={identifiersData}
                        moduleKey={activeModule}
                        shouldSkipFetching={identifiersFetching || !isTableView() || sidebarOpen}
                    />
                ) : (
                    getModuleFigureLayout()
                )}
            </Box>
        </Box>
    );
};

export default Module;
