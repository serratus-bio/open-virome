import React from 'react';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';


export const Chat = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [messages, setMessages] = useState([{message: "How can I help you today?", user: false}]);
    const [inputValue, setInputValue] = useState('');

    const onButtonClick = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
    };
    
    const handleSendMessage = () => {
        if (inputValue.trim() !== '') {
            setMessages([...messages, {message: inputValue, user: true}]);
            setInputValue('');
        }
    };

    // clc
    const handleClearMessages = () => {
        setMessages([{message: "How can I help you today?", user: false}]);
    }

    // sends msg when user presses enter
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const chatBubble = (messageObj) => {
        return (
            messageObj.user 
            ? 
            (<Box component="section" sx={{ bgcolor: '#C2C2C2', p: 1, border: 'rounded', borderRadius: '16px 16px 0 16px', ml: 'auto'}}>
            {messageObj.message}
            </Box>) 
            :
            (<Box component="section" sx={{ bgcolor: '#218AFF', p: 1, border: 'rounded', borderRadius: '16px 16px 16px 0'}}>
            {messageObj.message}
            </Box>)
        );
    }

    const presetChips = ['Generate Bioproject Summary', 'Generate MWAS Hypothesis', 'Option 3'];
    // preset chip actions
    const handleChipClick = (e) => {
        const chipLabel = e.target.innerText;
        switch (chipLabel) {
            case 'Generate Bioproject Summary':

                setMessages([...messages, {message: 'Bioproject Summary generated', user: false}]);
                break;
            case 'Generate MWAS Hypothesis':
                setMessages([...messages, {message: 'MWAS Hypothesis generated', user: false}]);
                break;
            case 'Option 3':
                setMessages([...messages, {message: 'Option 3 selected', user: false}]);
                break;
            default:
                break;
        }
    };


    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                }}
            >
                <Tooltip title='LLM research assistant' placement='bottom'>
                    <ChatOutlinedIcon style={{ backgroundColor: 'rgba(86, 86, 86, 0.4)' }} onClick={onButtonClick}>
                        <BlurOnIcon
                            style={{
                                color: '#9be3ef',
                                fontSize: 30,
                            }}
                        />
                    </ChatOutlinedIcon>
                </Tooltip>
            </Box>
            <Drawer
                anchor='right'
                open={isDrawerOpen}
                onClose={handleDrawerClose}
                sx={{ '& .MuiDrawer-paper': { width: '450px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h6'>Chat Assistant</Typography>
                    <Box>
                        <IconButton onClick={handleClearMessages}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={handleDrawerClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Divider />
                {/* Chat Messages */}
                <Box sx={{ flexGrow: 1 }}>
                    <List>
                        {messages.map((message, index) => (
                            <ListItem key={index}>
                                {/* <ListItemText primary={message.message} /> */}
                                {chatBubble(message)}
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Preset Options */}
                    <Stack direction='row' spacing={1}>
                        {presetChips.map((chip, index) => (
                            <Chip key={index} label={chip} onClick={handleChipClick} />
                        ))}
                    </Stack>
                    {/* Input */}
                    <TextField
                        label='Type your message'
                        variant='outlined'
                        fullWidth
                        multiline
                        rows={2}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ mr: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton color='primary' onClick={handleSendMessage}>
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Drawer>
        </>
    );
}

export default Chat;