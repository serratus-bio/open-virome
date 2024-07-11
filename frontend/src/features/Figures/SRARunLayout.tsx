import React from 'react';
import { isSummaryView } from '../../common/utils/plotHelpers.ts';

import Box from '@mui/material/Box';
import TargetControlFigure from './TargetControlFigure.tsx';
import BioprojectFigure from './BioprojectFigure.tsx';
import Typography from '@mui/material/Typography';

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
            {isSummaryView(identifiers) ? (
                <Typography
                    variant='h6'
                    sx={{
                        mt: 2,
                        mb: 2,
                        alignSelf: 'flex-start',
                    }}
                >
                    {'Dataset too large, displaying top rows.'}
                </Typography>
            ) : null}
            <Box sx={{ flex: 1, width: '100%' }}>{getFigure()}</Box>
        </Box>
    );
};

export default React.memo(SRARunLayout);
