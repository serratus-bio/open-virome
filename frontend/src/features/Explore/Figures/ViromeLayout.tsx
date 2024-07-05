import React from 'react';
import { getViromeGraphData } from '../../../common/utils/plotHelpers.ts';
import { useGetResultQuery } from '../../../api/client.ts';
import { sectionConfig } from '../constants.ts';
import { handleIdKeyIrregularities } from '../../../common/utils/queryHelpers.ts';

import Box from '@mui/material/Box';
import NetworkPlot from '../../../common/NetworkPlot.tsx';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const ViromeLayout = ({ identifiers }) => {
    const config = sectionConfig['Palmdb Virome'];
    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: config.resultsIdColumn,
            ids: identifiers ? identifiers[handleIdKeyIrregularities(config.resultsIdColumn)].single : [],
            idRanges: identifiers ? identifiers[handleIdKeyIrregularities(config.resultsIdColumn)].range : [],
            table: config.resultsTable,
            // sortByColumn: config.resultsIdColumn,
            // sortByDirection: 'asc',
            // pageStart: page * 10,
            // pageEnd: (page + 1) * 10,
        },
        {
            skip: !identifiers,
        },
    );

    const renderPlaceholder = () => {
        if (resultError) {
            return (
                <Box>
                    <Typography variant='h6'>Error loading data</Typography>
                </Box>
            );
        }
        if (resultIsFetching) {
            return (
                <Box>
                    <Skeleton variant='rect' width={800} height={400} />
                </Box>
            );
        }
        return (
            <Box>
                <Typography variant='h6'>No data available</Typography>
            </Box>
        );
    };

    const renderNetworkFigure = () => {
        const plotData = getViromeGraphData(resultData);
        return <NetworkPlot plotData={plotData} />;
    };

    const shouldRenderPlaceholder = (isError, isFetching, data) => {
        return isError || isFetching || !data || data.length === 0;
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {shouldRenderPlaceholder(resultError, resultIsFetching, resultData)
                ? renderPlaceholder()
                : renderNetworkFigure()}
        </Box>
    );
};

export default ViromeLayout;
