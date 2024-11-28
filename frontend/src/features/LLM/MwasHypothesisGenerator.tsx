import React from 'react';
import { useSelector } from 'react-redux';

import { selectAllFilters } from '../Query/slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';

import { useLazyGetHypothesisQuery } from '../../api/client.ts';
import { load } from '@fingerprintjs/botd';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { processGeneratedText } from './textFormatting.tsx';
import { GenerateButton } from './GenerateButton.tsx';

const MwasHypothesisGenerator = ({ identifiers, virusFamilies, selectedMetadata }) => {
    const filters = useSelector(selectAllFilters);

    const [getHypothesisText, { data: hypothesisData, isLoading: isLoadingHypothesis, error: errorHypothesis }] =
        useLazyGetHypothesisQuery();

    const onButtonClick = async () => {
        try {
            const botd = await load();
            const detect = await botd.detect();
            if (!detect || detect.bot === true) {
                throw new Error('Bot detected');
            }
            getHypothesisText({
                idColumn: 'bioproject',
                ids: identifiers ? identifiers['bioproject'].single : [],
                idRanges: identifiers ? identifiers['bioproject'].range : [],
                virusFamilies: virusFamilies ? virusFamilies : [],
                identifiers: identifiers,
                filters: getFilterQuery({ filters }),
                selectedMetadata: selectedMetadata,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderPlaceholder = () => {
        if (isLoadingHypothesis) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };
    const hypothesisTextIsNonEmpty = () => hypothesisData && hypothesisData?.text?.length > 0;

    return (
        <Box>
            <Box
                sx={{
                    zIndex: 10,
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    height: 45,
                    mr: hypothesisTextIsNonEmpty() ? 0 : '2%',
                }}
            >
            {GenerateButton({ onButtonClick, title: 'Generate Hypothesis' })}
            </Box>
            <Box
                sx={{
                    'flex': 1,
                    'minWidth': '90%',
                    'maxHeight': 300,
                    'overflow': 'auto',
                    'color-scheme': 'dark',
                }}
            >
                {renderPlaceholder()}
                {hypothesisTextIsNonEmpty() ? (
                    <Typography variant='body' sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap' }}>
                        {processGeneratedText(hypothesisData.text)}
                    </Typography>
                ) : null}
            </Box>

        </Box>
    );
};

export default MwasHypothesisGenerator;
