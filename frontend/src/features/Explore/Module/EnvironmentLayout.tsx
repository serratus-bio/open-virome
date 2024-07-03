import React from 'react';
import { useDispatch } from 'react-redux';
import { moduleConfig } from './constants.ts';
import { setActiveModule, setActiveView } from '../../../app/slice.ts';

import Box from '@mui/material/Box';
import MapPlot from '../../../common/MapLibreDeckGLMap.tsx';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';

const EnvironmentLayout = ({ identifiers }) => {
    const dispatch = useDispatch();

    const handleFilterClick = (moduleKey) => {
        dispatch(setActiveModule(moduleKey));
        dispatch(setActiveView('query'));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '60vh' }}>
            <Box sx={{ ml: 4, flex: 1, width: '100%', height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Typography component={'div'} variant='h6' sx={{ mt: 2, mb: 2, mr: 2 }}>
                        {moduleConfig['geography'].title}
                    </Typography>
                    <Box>
                        <IconButton
                            sx={{ mt: -0.5, height: 30, width: 30 }}
                            onClick={() => handleFilterClick('geography')}
                        >
                            <TuneIcon fontSize='small' />
                        </IconButton>
                    </Box>
                </Box>
                <MapPlot identifiers={identifiers} style={{ width: '100%', height: '100%' }} />
            </Box>
        </Box>
    );
};

export default EnvironmentLayout;
