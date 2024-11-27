import React from 'react';

import { useLazyGetHypothesisQuery } from '../../api/client.ts';
import { load } from '@fingerprintjs/botd';

import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

const MwasHypothesisGenerator = ({ identifiers, virusFamilies }) => {
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
                pageStart: 0,
                pageEnd: 1000,
                identifiers: identifiers,
            });
        } catch (error) {
            console.error(error);
        }
    };
    console.log(hypothesisData);
    const renderPlaceholder = () => {
        if (isLoadingHypothesis) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };
    const hypothesisTextIsNonEmpty = () => hypothesisData && hypothesisData?.text?.length > 0;

    const processHypothesisText = (text) => {
        const combinedRegex = /PRJ\w+|\|([^|]+)\|/g;
        const combinedMatches = text.match(combinedRegex);
        if (combinedMatches) {
            const finalComponents: (string | JSX.Element)[] = [];
            let lastIndex = 0;
            combinedMatches.forEach((match, index) => {
                const matchIndex = text.indexOf(match, lastIndex);
                if (matchIndex > lastIndex) {
                    finalComponents.push(text.substring(lastIndex, matchIndex));
                }
                if (/PRJ\w+/.test(match)) {
                    finalComponents.push(
                        <Link
                            key={`link-${index}`}
                            href={`https://www.ncbi.nlm.nih.gov/bioproject/${match}`}
                            target='_blank'
                        >
                            {match}
                        </Link>,
                    );
                } else if (/\|([^|]+)\|/.test(match)) {
                    finalComponents.push(
                        <span key={`bold-${index}`} style={{ fontWeight: 'bold' }}>
                            {match.slice(1, -1)}
                        </span>,
                    );
                }
                lastIndex = matchIndex + match.length;
            });
            if (lastIndex < text.length) {
                finalComponents.push(text.substring(lastIndex));
            }
            return finalComponents;
        }
        return text;
    };

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
                <Tooltip title='Generate MWAS Hypotheses' placement='bottom'>
                    <IconButton style={{ backgroundColor: 'rgba(86, 86, 86, 0.4)' }} onClick={onButtonClick}>
                        <BlurOnIcon
                            style={{
                                color: '#9be3ef',
                                fontSize: 30,
                            }}
                        />
                    </IconButton>
                </Tooltip>
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
                        {processHypothesisText(hypothesisData.text)}
                    </Typography>
                ) : null}
            </Box>

        </Box>
    );
};

export default MwasHypothesisGenerator;
