import React, { useState } from 'react';
import { useLazyGetGlobalChatQuery } from '../../api/client.ts';
import { useDispatch, useSelector } from 'react-redux';
import { addFilter } from '../Query/slice.ts';
import { isBotDetected } from '../../common/utils/botDetection.ts';
import { formatLLMGeneratedText } from './textFormatting.tsx';
import { selectChatMessages, addChatMessage, toggleChat, clearChatMessages } from './slice.ts';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CrossIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';

const GlobalChat = () => {
    const dispatch = useDispatch();
    const chatMessages = useSelector(selectChatMessages);
    const [query, setQuery] = useState('');
    const [
        getGlobalChat,
        { data: globalChatData, error: globalChatError, isFetching: isFetchingGlobalChat },
        lastRequestInfo,
    ] = useLazyGetGlobalChatQuery();

    const handleQuery = async () => {
        if (!query) {
            return;
        }
        dispatch(addChatMessage({ text: query, role: 'user', mode: 'global' }));

        const { data } = await getGlobalChat({
            message: query,
            conversation: [],
        });

        if (data) {
            dispatch(
                addChatMessage({
                    text: data.text,
                    role: 'assistant',
                    mode: 'global',
                    conversation: data.conversation,
                }),
            );
        }
    };

    const onFilterTextClick = (filterText) => {
        const filterType = filterText.split(':')[0].trim();
        const filterValue = filterText.split(':')[1].trim();
        dispatch(
            addFilter({
                filterId: `${filterType}-${filterValue}`,
                filterType,
                filterValue,
            }),
        );
        dispatch(toggleChat());
    };

    const onlyShowGlobalChat = () => {
        if (chatMessages.length === 0) {
            return false;
        }
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage.mode === 'global' && lastMessage.role === 'assistant';
    };

    const renderPlaceholder = () => {
        if (isFetchingGlobalChat) {
            return (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Skeleton variant='text' width={'50%'} height={100} />
                    <FormHelperText>Generating report... (Global queries can take up to 30 seconds)</FormHelperText>
                </Box>
            );
        }
        return null;
    };

    const renderReportResponse = () => {
        if (isFetchingGlobalChat || !onlyShowGlobalChat()) {
            return null;
        }
        const lastMessage = chatMessages[chatMessages.length - 1];
        return (
            <Box
                sx={{
                    backgroundColor: 'rgba(72, 72, 72, 0.9)',
                    p: 2,
                    borderRadius: 2,
                    overflow: 'auto',
                    colorScheme: 'dark',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '80%',
                    height: '100%',
                    flex: 1,
                    mt: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'left',
                        width: '100%',
                        mb: 1,
                        position: 'relative',
                    }}
                >
                    <IconButton
                        onClick={() => {
                            dispatch(clearChatMessages());
                        }}
                        sx={{ width: 40, height: 40, position: 'absolute', top: 0, right: 0 }}
                    >
                        <CrossIcon />
                    </IconButton>
                </Box>
                <Typography variant='body' sx={{ fontSize: '0.9em', mb: 4, whiteSpace: 'pre-wrap' }}>
                    {formatLLMGeneratedText(lastMessage?.text, lastMessage?.conversation, onFilterTextClick)}
                </Typography>
            </Box>
        );
    };

    const renderSearchInputField = () => {
        if (isFetchingGlobalChat) {
            return null;
        }
        return (
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        width: '100%',
                    }}
                >
                    <TextField
                        id='outlined-multiline-static'
                        placeholder='Query the global virome'
                        multiline
                        rows={2}
                        variant='outlined'
                        autoFocus
                        sx={{
                            'width': '50%',
                            '& .MuiInputBase-root': {
                                borderRadius: 4,
                                backgroundColor: '#2f2f2f',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'transparent',
                                },
                            },
                        }}
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const isBot = await isBotDetected();
                                if (!isBot) {
                                    handleQuery();
                                }
                            }
                        }}
                    />
                </Box>
                <FormHelperText sx={{ mb: -1 }}>
                    <Link
                        href={'https://github.com/serratus-bio/open-virome/wiki/LLM-Integration'}
                        target='_blank'
                        rel='noreferrer'
                    >
                        GraphRAG LLMs
                    </Link>
                    {` may make mistakes. Check important info.`}
                </FormHelperText>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {renderPlaceholder()}
            {renderReportResponse()}
            {renderSearchInputField()}
        </Box>
    );
};

export default GlobalChat;
