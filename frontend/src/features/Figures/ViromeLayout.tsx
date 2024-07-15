import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModuleBySection } from '../../app/slice.ts';
import { getViromeGraphData, isSummaryView } from '../../common/utils/plotHelpers.ts';
import { useGetResultQuery } from '../../api/client.ts';
import { moduleConfig } from '../Module/constants.ts';
import { handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';

import NetworkPlot from '../../common/NetworkPlot.tsx';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const ViromeLayout = ({ identifiers }) => {
    const activeModule = useSelector((state) => selectActiveModuleBySection(state, 'palmdb'));
    const [randomized, setRandomized] = useState(0);
    const {
        data: resultData,
        error: resultError,
        isFetching: resultIsFetching,
    } = useGetResultQuery(
        {
            idColumn: moduleConfig[activeModule].resultsIdColumn,
            ids: identifiers
                ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].single
                : [],
            idRanges: identifiers
                ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].range
                : [],
            table: moduleConfig[activeModule].resultsTable,
            pageStart: 0,
            pageEnd: isSummaryView(identifiers) ? 300 : undefined,
            sortBy: isSummaryView(identifiers) ? 'gb_pid' : undefined,
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    height: 100,
                    width: '100%',
                }}
            >
                <Typography variant='h6'>No data available</Typography>
            </Box>
        );
    };

    const renderNetworkFigure = () => {
        const plotData = getViromeGraphData(resultData, moduleConfig[activeModule].groupByKey);
        return <NetworkPlot plotData={plotData} />;
    };

    const shouldRenderPlaceholder = (isError, isFetching, data) => {
        return isError || isFetching || !data || data.length === 0;
    };

    // useEffect(() => {
    //     setRandomized(randomized + 1);
    // }, [activeModule]);

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {resultData && resultData.length > 1000 ? (
                <Box
                    sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100%', mb: 2 }}
                >
                    <Typography variant='h6'>Dataset is too large. Displaying components of subsample. </Typography>
                    <Button
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setRandomized(randomized + 1);
                        }}
                    >
                        Shuffle
                    </Button>
                </Box>
            ) : null}
            {shouldRenderPlaceholder(resultError, resultIsFetching, resultData)
                ? renderPlaceholder()
                : renderNetworkFigure()}
        </Box>
    );
};

export default React.memo(ViromeLayout);
