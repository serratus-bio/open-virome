import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, selectSidebarOpen } from './slice.ts';
import { useTheme } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import FilterTags from '../features/Query/FilterTags.tsx';
import IconButton from '@mui/material/IconButton';
import PageviewIcon from '@mui/icons-material/Pageview';
import TuneIcon from '@mui/icons-material/Tune';

const AppToolbar = () => {
    const dispatch = useDispatch();
    const open = useSelector(selectSidebarOpen);

    const drawerWidth = 240;
    const theme = useTheme();

    const getAppBarStyles = () => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            zIndex: 1400,
        }),
    });

    const handleDrawerOpen = () => {
        dispatch(toggleSidebar());
    };

    return (
        <AppBar position='fixed' sx={getAppBarStyles()}>
            <Toolbar sx={{ width: '100%' }}>
                <IconButton
                    color='white'
                    aria-label='open drawer'
                    onClick={handleDrawerOpen}
                    edge='start'
                    sx={{
                        ml: '9%',
                        mr: 2,
                        ...(open && { display: 'none' }),
                    }}
                >
                    <TuneIcon fontSize='large' />
                </IconButton>
                <FilterTags />
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;
