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

export const formatLLMGeneratedText = (text, conversation = []) => {
    if (!text) {
        return null;
    }
    const regexPatterns = {
        'Bioproject': /PRJ\w+/,
        'Markdown bold 1': /\*{2}(?!PRJ)(.*?)\*{2}/,
        'Markdown bold 2': /_{2}(?!PRJ)(.*?)_{2}/,
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
            // NCBI links
            if (regexPatterns['Bioproject'].test(match)) {
                let cleanMatch = match.match(regexPatterns['Bioproject'])[0];
                finalComponents.push(
                    <Link
                        key={`link-${index}-${cleanMatch}`}
                        href={`https://www.ncbi.nlm.nih.gov/bioproject/${cleanMatch}`}
                        target='_blank'
                    >
                        {match}
                    </Link>,
                );
            }
            // Markdown formatting
            else if (regexPatterns['Markdown bold 1'].test(match) || regexPatterns['Markdown bold 2'].test(match)) {
                const cleanText = match.slice(2, -2);
                finalComponents.push(
                    <span key={`bold-${index}`} style={{ fontWeight: 'bold' }}>
                        {cleanText}
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
