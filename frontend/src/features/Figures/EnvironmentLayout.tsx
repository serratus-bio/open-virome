import React from 'react';

import Box from '@mui/material/Box';
import MapPlot from '../../common/MapLibreDeckGLMap.tsx';

const EnvironmentLayout = ({ identifiers }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '60vh',
                mb: 40,
            }}
        >
            <MapPlot identifiers={identifiers} style={{ width: '100%', height: '100%' }} />
        </Box>
    );
};

export default React.memo(EnvironmentLayout);
