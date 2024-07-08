import React from 'react';
import { moduleConfig } from '../Module/constants.ts';

import Box from '@mui/material/Box';
import MapPlot from '../../common/MapLibreDeckGLMap.tsx';
import Typography from '@mui/material/Typography';

const EnvironmentLayout = ({ identifiers }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '60vh' }}>
            <Box sx={{ ml: 4, flex: 1, width: '100%', height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Typography component={'div'} variant='h6' sx={{ mt: 2, mb: 2, mr: 2 }}>
                        {moduleConfig['geography'].title}
                    </Typography>
                </Box>
                <MapPlot identifiers={identifiers} style={{ width: '100%', height: '100%' }} />
            </Box>
        </Box>
    );
};

export default EnvironmentLayout;
