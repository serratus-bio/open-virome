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
        console.log(text);
        // const bioProjectRegex = /PRJNA\d+/g;
        // const boldRegex = /\|([^|]+)\|/g;
        // bioproject can be of form PRJNA or PRJEB or PRJDB, just check for starting with PRJ
        const combinedRegex = /PRJ\w+|\|([^|]+)\|/g;

        // Find all matches for the combined regex
        const combinedMatches = text.match(combinedRegex);
        console.log(combinedMatches);
    
        if (combinedMatches) {
            const finalComponents: (string | JSX.Element)[] = [];
            let lastIndex = 0;
    
            combinedMatches.forEach((match, index) => {
                const matchIndex = text.indexOf(match, lastIndex);
    
                // Add the text segment before the match
                if (matchIndex > lastIndex) {
                    finalComponents.push(text.substring(lastIndex, matchIndex));
                }
    
                // Process the match
                if (/PRJ\w+/.test(match)) {
                    finalComponents.push(
                        <Link
                            key={`link-${index}`}
                            href={`https://www.ncbi.nlm.nih.gov/bioproject/${match}`}
                            target='_blank'
                        >
                            {match}
                        </Link>
                    );
                } else if (/\|([^|]+)\|/.test(match)) {
                    finalComponents.push(
                        <span
                        key={`bold-${index}`}
                        style={{ fontWeight: "bold" }}
                    >
                        {match.slice(1, -1)}
                    </span>
                    );
                }
    
                lastIndex = matchIndex + match.length;
            });
    
            // Add the remaining text segment after the last match
            if (lastIndex < text.length) {
                finalComponents.push(text.substring(lastIndex));
            }
    
            console.log(finalComponents);
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
