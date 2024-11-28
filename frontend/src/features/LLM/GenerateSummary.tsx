import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';
import { formatLLMGeneratedText } from './textFormatting.tsx';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import GenerateButton from './GenerateButton.tsx';

const GenerateSummary = ({ identifiers }) => {
    const [getSummaryText, { data: summaryData, isLoading: isLoadingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = async () => {
        await getSummaryText(
            {
                idColumn: 'bioproject',
                ids: identifiers ? identifiers['bioproject'].single : [],
            },
            true,
        );
    };

    const renderPlaceholder = () => {
        if (isLoadingSummary) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const summaryTextIsNonEmpty = () => summaryData && summaryData?.text?.length > 0;

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                justifyItems: 'flex-start',
                height: summaryTextIsNonEmpty() || isLoadingSummary ? '100%' : 0,
                mb: summaryTextIsNonEmpty() || isLoadingSummary ? 4 : 0,
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
                {!isLoadingSummary && summaryTextIsNonEmpty() ? (
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
                            {formatLLMGeneratedText(summaryData.text, summaryData.conversation)}
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
                    mr: summaryTextIsNonEmpty() ? 0 : '-10%',
                }}
            >
                <GenerateButton onButtonClick={onButtonClick} title={'Generate Summary'} />
            </Box>
        </Box>
    );
};

export default GenerateSummary;
