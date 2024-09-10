import React from 'react';

import Box from '@mui/material/Box';
import TargetControlFigure from './TargetControlFigure.tsx';
import BioprojectFigure from './BioprojectFigure.tsx';

const SRARunLayout = ({ identifiers, activeModule }) => {
    const getFigure = () => {
        if (activeModule === 'host') {
            return <TargetControlFigure identifiers={identifiers} moduleKey={'host'} figureType={'bar'} />;
        } else if (activeModule === 'seqType') {
            return <TargetControlFigure identifiers={identifiers} moduleKey={'seqType'} figureType={'polar'} />;
        } else if (activeModule === 'bioproject') {
            return <BioprojectFigure identifiers={identifiers} />;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ flex: 1, width: '100%' }}>{getFigure()}</Box>
        </Box>
    );
};

export default React.memo(SRARunLayout);
