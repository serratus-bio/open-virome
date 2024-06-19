import React from 'react';
import { useDispatch } from 'react-redux';
import { setActiveModule, setActiveView } from '../../app/slice.ts';
import { moduleConfig } from './constants.ts';
import { transformRowsToPlotData } from '../../common/utils/plotHelpers.ts';
import { useGetCountsQuery } from '../../api/client.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import Skeleton from '@mui/material/Skeleton';
import BarPlot from '../../common/BarPlot.tsx';

const Module = ({ identifiers, moduleKey, isFigureView }) => {
    const dispatch = useDispatch();

    const {
        data: countData,
        error: countError,
        isFetching: countIsFetching,
    } = useGetCountsQuery({
        idColumn: 'run',
        ids: identifiers ? identifiers['run'].single : [],
        idRanges: identifiers ? identifiers['run'].range : [],
        groupBy: moduleConfig[moduleKey].groupByKey,
        sortByColumn: 'count',
        sortByDirection: 'desc',
        pageStart: 0,
    },
    {
        skip: identifiers['run'].single.length > 10000,
    }
);

    const {
        data: controlCountData,
        error: controlCountError,
        isFetching: controlCountIsFetching,
    } = useGetCountsQuery({
        idColumn: 'bioproject',
        ids: identifiers ? identifiers['bioproject'].single : [],
        idRanges: identifiers ? identifiers['bioproject'].range : [],
        groupBy: moduleConfig[moduleKey].groupByKey,
        sortByColumn: 'count',
        sortByDirection: 'desc',
        pageStart: 0,
    });

    const handleFilterClick = (moduleKey) => {
        dispatch(setActiveModule(moduleKey));
        dispatch(setActiveView('query'));
    };

    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    const renderFigureView = (countData, controlCountData) => {
        const plotData = transformRowsToPlotData(countData, controlCountData);
        return <BarPlot plotData={plotData} />;
    };

    const shouldRenderPlaceholder = () => {
        return (
            countError ||
            controlCountError ||
            countIsFetching ||
            controlCountIsFetching ||
            !countData ||
            !controlCountData
        );
    };

    const renderPlaceholder = () => {
        if (countError || controlCountError) {
            return (
                <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        Error loading data
                    </Typography>
                </Box>
            );
        }
        if (
            countData &&
            countData.length === 0 &&
            !countIsFetching &&
            controlCountData &&
            controlCountData.length === 0 &&
            !controlCountIsFetching
        ) {
            return (
                <Box sx={{ flex: 1, height: 100 }}>
                    <Typography variant='body1' sx={{ ...sectionStyle }}>
                        {`No ${moduleConfig[moduleKey].title.toLowerCase()} data available`}
                    </Typography>
                </Box>
            );
        }
        return (
            <Box sx={{ flex: 1 }}>
                <Skeleton width='90%' height={300} />
            </Box>
        );
    };

    return (
        <Box
            sx={{
                maxWidth: 490,
                flex: 1,
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Typography component={'div'} variant='h6' sx={{ ...sectionStyle, mr: 2 }}>
                    {moduleConfig[moduleKey].title}
                </Typography>
                <Box>
                    <IconButton sx={{ mt: -0.5, height: 30, width: 30 }} onClick={() => handleFilterClick(moduleKey)}>
                        <TuneIcon fontSize='small' />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ minWidth: 400 }}>
                {shouldRenderPlaceholder() ? renderPlaceholder() : renderFigureView(countData, controlCountData)}
            </Box>
        </Box>
    );
};

export default Module;
