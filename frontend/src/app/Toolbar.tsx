import React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import FilterTags from '../features/Query/FilterTags.tsx';

const AppToolbar = () => {
    const drawerWidth = 240;
    return (
        <AppBar
            position='fixed'
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            }}
        >
            <Toolbar sx={{ width: '100%' }}>
                <FilterTags />
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;
