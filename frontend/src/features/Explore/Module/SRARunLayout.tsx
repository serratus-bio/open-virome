import React from 'react';

import Box from '@mui/material/Box';
import TargetControlFigure from './TargetControlFigure.tsx';

const SRARunLayout = ({ identifiers }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mr: 4, flex: 1 }}>
                <TargetControlFigure identifiers={identifiers} moduleKey={'host'} figureType={'bar'} />
            </Box>
            <Box sx={{ mr: 4, flex: 1 }}>
                <TargetControlFigure identifiers={identifiers} moduleKey={'seqType'} figureType={'polar'} />
            </Box>
        </Box>
    );
};

export default SRARunLayout;
