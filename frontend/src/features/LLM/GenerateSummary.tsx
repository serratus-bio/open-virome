import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';
import { load } from '@fingerprintjs/botd';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { processGeneratedText } from './textFormatting.tsx';
import { GenerateButton } from './GenerateButton.tsx';

const GenerateSummary = ({ identifiers }) => {
    const [getSummaryText, { data: summaryData, isLoading: isLoadingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = async () => {
        try {
            const botd = await load();
            const detect = await botd.detect();
            if (!detect || detect.bot === true) {
                throw new Error('Bot detected');
            }
            getSummaryText({ ids: identifiers ? identifiers['bioproject'].single : [] }, true);
        } catch (error) {
            console.error(error);
        }
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
            {}
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
                {summaryTextIsNonEmpty() ? (
                    <Typography variant='body' sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap' }}>
                        {processGeneratedText(summaryData.text)}
                    </Typography>
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
                {GenerateButton({ onButtonClick, title: 'Generate Summary' })}
            </Box>
        </Box>
    );
};

export default GenerateSummary;
