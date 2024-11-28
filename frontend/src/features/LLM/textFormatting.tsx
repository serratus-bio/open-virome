import React from 'react';
import Link from '@mui/material/Link';

export const processGeneratedText = (text) => {
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