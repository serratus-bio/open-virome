import React from 'react';
import { isSimpleLayout } from '../../../common/utils/plotHelpers.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TargetControlFigure from './TargetControlFigure.tsx';
import BioprojectFigure from './BioprojectFigure.tsx';

const SRARunLayout = ({ identifiers, sectionLayout }) => {
    const getFigures = () => {
        if (isSimpleLayout(sectionLayout)) {
            return (
                <Box sx={{ flex: 1, width: '100%' }}>
                    <TargetControlFigure
                        identifiers={identifiers}
                        moduleKey={'host'}
                        figureType={'bar'}
                        sectionLayout={sectionLayout}
                    />
                </Box>
            );
        } else {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='h6' sx={{ mt: 4, mb: 4 }}>
                        {`Run Label`}
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%', mb: 4 }}>
                        <TargetControlFigure
                            identifiers={identifiers}
                            moduleKey={'host'}
                            figureType={'bar'}
                            sectionLayout={sectionLayout}
                        />
                    </Box>
                    <Typography variant='h6' sx={{ mt: 4, mb: 4 }}>
                        {`Run Technology`}
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%', mb: 4 }}>
                        <TargetControlFigure
                            identifiers={identifiers}
                            moduleKey={'seqType'}
                            figureType={'polar'}
                            sectionLayout={sectionLayout}
                        />
                    </Box>
                    <Typography variant='h6' sx={{ mt: 4, mb: 4 }}>
                        {`BioProject`}
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <BioprojectFigure identifiers={identifiers} />
                    </Box>
                </Box>
            );
        }
    };

    return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{getFigures()}</Box>;
};

export default React.memo(SRARunLayout);
