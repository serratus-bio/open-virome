import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, selectSidebarOpen } from './slice.ts';
import { toggleChat, selectChatOpen } from '../features/LLM/slice.ts';
import { useTheme } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import FilterTags from '../features/Query/FilterTags.tsx';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import Tooltip from '@mui/material/Tooltip';

const AppToolbar = () => {
    const dispatch = useDispatch();
    const isFilterOpen = useSelector(selectSidebarOpen);
    const isChatOpen = useSelector(selectChatOpen);
    const theme = useTheme();
    const drawerWidth = 100;

    const getAppBarStyles = () => ({
        'transition': theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        '& .MuiToolbar-root': { padding: 0 },
        ...(isFilterOpen && {
            'width': `calc(100% - ${drawerWidth}px)`,
            'marginLeft': `${drawerWidth}px`,
            'transition': theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            'zIndex': 1400,
            '& .MuiToolbar-root': { paddingLeft: 4 },
        }),
    });

    const handleFilterClick = () => {
        if (isChatOpen) {
            dispatch(toggleChat());
        }
        dispatch(toggleSidebar());
    };

    const handleChatClick = () => {
        if (isFilterOpen) {
            dispatch(toggleSidebar());
        }
        dispatch(toggleChat());
    };

    return (
        <AppBar position='fixed' sx={getAppBarStyles()}>
            <Toolbar sx={{ width: '100%', pl: 0 }}>
                {!isFilterOpen ? (
                    <Tooltip title='Filters' placement='bottom'>
                        <IconButton
                            aria-label='open drawer'
                            onClick={handleFilterClick}
                            edge='start'
                            sx={{
                                backgroundColor: 'rgba(86, 86, 86, 0.7)',
                                mr: 2,
                                ml: '3%',
                            }}
                        >
                            <TuneIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                ) : null}
                {/* OV */}
                <Box sx={{ minWidth: 150, ml: 2 }}>
                    <Typography variant='h5' noWrap sx={{ display: isFilterOpen ? 'none' : 'block' }}>
                        Open Virome
                    </Typography>
                </Box>
                <FilterTags />
                {!isChatOpen ? (
                    <Tooltip title='LLM Research Assistant' placement='bottom'>
                        <IconButton
                            aria-label='open drawer'
                            onClick={handleChatClick}
                            edge='start'
                            sx={{
                                backgroundColor: 'rgba(86, 86, 86, 0.7)',
                                position: 'absolute',
                                right: '3%',
                                ...(isChatOpen && { display: 'none' }),
                            }}
                        >
                            <ChatOutlinedIcon fontSize='medium' />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;
