import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { selectDarkMode } from './slice.ts';
import { store } from './store.ts';

import SidePanel from '../features/Query/SidePanel.tsx';
import AppToolbar from './Toolbar.tsx';
import Tabs from './Tabs.tsx';
import Box from '@mui/material/Box';

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

const App = () => {
    const darkMode = useSelector(selectDarkMode);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppToolbar />
                <SidePanel />
                <Tabs />
            </Box>
        </ThemeProvider>
    );
};

export default AppWrapper;
