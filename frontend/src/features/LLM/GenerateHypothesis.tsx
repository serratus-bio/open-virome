import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAllFilters } from '../Query/slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { useLazyGetHypothesisQuery } from '../../api/client.ts';
import { formatLLMGeneratedText } from './textFormatting.tsx';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import GenerateButton from './GenerateButton.tsx';

const GenerateHypothesis = ({ identifiers, selectedMetadata }) => {
    const [displayMessage, setDisplayMessage] = useState('');
    const filters = useSelector(selectAllFilters);

    const [getHypothesisText, { data: hypothesisData, isLoading: isLoadingHypothesis, error: errorHypothesis }] =
        useLazyGetHypothesisQuery();

    useEffect(() => {
        if (hypothesisData && hypothesisData.text) {
            setDisplayMessage(hypothesisData.text);
        } else if (isLoadingHypothesis) {
            setDisplayMessage('');
        }
    }, [hypothesisData, isLoadingHypothesis]);

    const onButtonClick = async () => {
        if (isLoadingHypothesis) {
            return;
        }
        await getHypothesisText({
            idColumn: 'bioproject',
            ids: identifiers ? identifiers['bioproject'].single : [],
            idRanges: identifiers ? identifiers['bioproject'].range : [],
            filters: getFilterQuery({ filters }),
            selectedMetadata: selectedMetadata,
        });
    };

    const renderPlaceholder = () => {
        if (isLoadingHypothesis) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const hypothesisTextIsNonEmpty = () => displayMessage && displayMessage?.length > 0;

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                justifyItems: 'flex-start',
                height: hypothesisTextIsNonEmpty() || isLoadingHypothesis ? '100%' : 0,
                mt: 4,
                mb: 6,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minWidth: '90%',
                    maxHeight: 300,
                }}
            >
                {renderPlaceholder()}
                {!isLoadingHypothesis && hypothesisTextIsNonEmpty() ? (
                    <Box
                        sx={{
                            backgroundColor: '#484848',
                            p: 2,
                            borderRadius: 2,
                            overflow: 'auto',
                            colorScheme: 'dark',
                            maxHeight: 300,
                        }}
                    >
                        <Typography variant='body' sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap' }}>
                            {formatLLMGeneratedText(displayMessage)}
                        </Typography>
                    </Box>
                ) : null}
            </Box>
            <Box
                sx={{
                    zIndex: 10,
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    height: 45,
                }}
            >
                <GenerateButton onButtonClick={onButtonClick} title={'Generate Hypothesis'} />
            </Box>
        </Box>
    );
};

export default GenerateHypothesis;
