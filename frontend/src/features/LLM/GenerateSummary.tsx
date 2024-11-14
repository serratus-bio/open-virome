import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';

import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const GenerateSummary = ({ identifiers }) => {
    const [getSummaryText, { data: summaryData, isLoading: isLoadingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = () => {
        getSummaryText({ ids: identifiers ? identifiers['bioproject'].single : [] });
    };

    const renderPlaceholder = () => {
        if (isLoadingSummary) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const summaryTextIsNonEmpty = () => summaryData && summaryData?.text?.length > 0;

    const processSummaryText = (text) => {
        // support newlines in the summary text by replacing \n with <br>
        return text;
    };

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
                    // hide scrollbar
                    // '&::-webkit-scrollbar': {
                    //     display: 'none'
                    // },
                    // '-ms-overflow-style': 'none',
                    // scrollbarWidth: 'none',
                    // color-scheme: dark;
                    'color-scheme': 'dark',
                }}
            >
                {renderPlaceholder()}
                {summaryTextIsNonEmpty() ? (
                    <Typography variant='body2' sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap' }}>
                        {processSummaryText(summaryData.text)}
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
                <IconButton style={{ backgroundColor: 'rgba(86, 86, 86, 0.4)' }} onClick={onButtonClick}>
                    <BlurOnIcon
                        style={{
                            color: '#9be3ef',
                            fontSize: 30,
                        }}
                    />
                </IconButton>
            </Box>
        </Box>
    );
};

export default GenerateSummary;
