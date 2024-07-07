import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { selectDarkMode } from './slice.ts';
import { store } from './store.ts';

import SidePanel from '../features/Query/SidePanel.tsx';
import AppToolbar from './Toolbar.tsx';
import Box from '@mui/material/Box';
import Module from '../features/Module/Module.tsx';

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

const App = () => {
    const dispatch = useDispatch();
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
                <Module />
            </Box>
        </ThemeProvider>
    );
};

export default AppWrapper;
