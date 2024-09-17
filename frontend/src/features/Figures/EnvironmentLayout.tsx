import React from 'react';
import Box from '@mui/material/Box';
import MapPlot from '../../common/MapLibreDeckGLMap.tsx';

const EnvironmentLayout = ({ identifiers, sectionLayout }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                mb: 10,
            }}
        >
            <MapPlot identifiers={identifiers} layout={sectionLayout} />
        </Box>
    );
};

export default React.memo(EnvironmentLayout);
