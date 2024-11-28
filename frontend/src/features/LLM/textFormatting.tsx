import React from 'react';
import Link from '@mui/material/Link';
import MdCopyAll from '@mui/icons-material/CopyAll';

const copyFullConversationButton = (fullConversation) => {
    const copyFullConversation = () => {
        navigator.clipboard.writeText(JSON.stringify(fullConversation));
    };

    return (
        <Link
            onClick={copyFullConversation}
            sx={{
                'display': 'flex',
                'alignItems': 'center',
                'cursor': 'pointer',
                'color': 'text.secondary',
                '&:hover': {
                    color: 'text.primary',
                },
                'mt': 4,
            }}
        >
            <MdCopyAll sx={{ mr: 1 }} />
            Copy full conversation
        </Link>
    );
};

export const formatLLMGeneratedText = (text, conversation) => {
    const regexPatterns = {
        'Bioproject': /PRJ\w+/,
        'Markdown bold': /\*{2}(.*?)\*{2}/,
        'Markdown italic 1': /_([^|]+)_/,
        'Markdown italic 2': /\*([^|]+)\*/,
    };
    const combinedRegex = new RegExp(
        Object.values(regexPatterns)
            .map((regex) => `(${regex.source})`)
            .join('|'),
        'g',
    );
    const combinedMatches = text.match(combinedRegex);
    if (combinedMatches) {
        const finalComponents: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        combinedMatches.forEach((match, index) => {
            const matchIndex = text.indexOf(match, lastIndex);
            if (matchIndex > lastIndex) {
                finalComponents.push(text.substring(lastIndex, matchIndex));
            }
            // Markdown bold
            if (regexPatterns['Markdown bold'].test(match)) {
                finalComponents.push(
                    <span key={`bold-${index}`} style={{ fontWeight: 'bold' }}>
                        {match.slice(2, -2)}
                    </span>,
                );
            }
            // Bioproject link
            else if (regexPatterns['Bioproject'].test(match)) {
                finalComponents.push(
                    <Link
                        key={`link-${index}`}
                        href={`https://www.ncbi.nlm.nih.gov/bioproject/${match}`}
                        target='_blank'
                    >
                        {match}
                    </Link>,
                );
            }
            // Markdown italic
            else if (regexPatterns['Markdown italic 1'].test(match) || regexPatterns['Markdown italic 2'].test(match)) {
                finalComponents.push(
                    <span key={`italic-${index}`} style={{ fontStyle: 'italic' }}>
                        {match.slice(1, -1)}
                    </span>,
                );
            }
            lastIndex = matchIndex + match.length;
        });
        if (lastIndex < text.length) {
            finalComponents.push(text.substring(lastIndex));

            if (conversation) {
                finalComponents.push(copyFullConversationButton(conversation));
            }
        }
        return finalComponents;
    }
    return text;
};
