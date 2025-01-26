import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';
import { formatLLMGeneratedText } from './textFormatting.tsx';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import GenerateButton from './GenerateButton.tsx';

const GenerateSummary = ({ identifiers, dataType }) => {
    console.log(identifiers);
    switch (dataType) {
        case 'sra':
            dataType = 'bioproject';
            break;
        case 'palmdb':
            dataType = 'virome';
            break;
        case 'ecology': // stays the same
            dataType = 'ecology';
            break;
        case 'host':
            dataType = 'host';
            break;
        default:
            dataType = ''; // throw err
    }
    const [getSummaryText, { data: summaryData, isFetching: isFetchingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = async () => {
        if (isFetchingSummary) {
            return;
        }
        await getSummaryText(
            {
                idColumn: 'bioproject',
                ids: identifiers 
                ? (dataType == 'bioproject' ? identifiers['bioproject'].single : identifiers) 
                : [],
            },
            true,
        );
    };

    const renderPlaceholder = () => {
        if (isFetchingSummary) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const summaryTextIsNonEmpty = () => summaryData && summaryData?.text?.length > 0;
    return (
        <Box
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}
        >
            <GenerateButton onButtonClick={onButtonClick} title={'Generate Summary'} />
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    justifyItems: 'flex-start',
                    height: summaryTextIsNonEmpty() || isFetchingSummary ? '100%' : 0,
                    mb: summaryTextIsNonEmpty() || isFetchingSummary ? 4 : 0,
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
                    {!isFetchingSummary && summaryTextIsNonEmpty() ? (
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
                                {formatLLMGeneratedText(summaryData?.text, summaryData?.conversation)}
                            </Typography>
                        </Box>
                    ) : null}
                </Box>
            </Box>
        </Box>
    );
};

export default GenerateSummary;
