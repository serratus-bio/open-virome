import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';

import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const GenerateSummary = ({ identifiers }) => {
    const [getSummaryText, { data: summaryData, isLoading: isLoadingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = () => {
        getSummaryText({ ids: identifiers ? identifiers['bioproject'].single : [] }, true);
    };

    const renderPlaceholder = () => {
        if (isLoadingSummary) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const summaryTextIsNonEmpty = () => summaryData && summaryData?.text?.length > 0;

    const processSummaryText = (text) => {
        // const bioProjectRegex = /PRJNA\d+/g;
        // bioproject can be of form PRJNA or PRJEB or PRJDB, just check for starting with PRJ
        const bioProjectRegex = /PRJ\w+/g;
        const bioProjectMatches = text.match(bioProjectRegex);
        if (bioProjectMatches) {
            const components = text.split(bioProjectRegex);
            const finalComponents = [];
            for (let i = 0; i < components.length; i++) {
                finalComponents.push(components[i]);
                if (i < bioProjectMatches.length) {
                    finalComponents.push(
                        <Link
                            key={i}
                            href={`https://www.ncbi.nlm.nih.gov/bioproject/${bioProjectMatches[i]}`}
                            target='_blank'
                        >
                            {bioProjectMatches[i]}
                        </Link>,
                    );
                }
            }
            return finalComponents;
        }

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
