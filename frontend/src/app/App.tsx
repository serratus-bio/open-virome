import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store.ts';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { selectDarkMode } from './slice.ts';

import SidePanel from '../features/Query/SidePanel.tsx';
import AppToolbar from './Toolbar.tsx';
import Box from '@mui/material/Box';
import QuerySummaryText from '../features/Query/QuerySummaryText.tsx';
import Module from '../features/Module/Module.tsx';
import QueryView from '../features/Query/QueryView.tsx';
import Toolbar from '@mui/material/Toolbar';
import Footer from './Footer.tsx';

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

    const getContainerStyles = () => ({
        flexGrow: 1,
        /* padding below toolbar */
        padding: theme.spacing(0),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        /* left Section Margin */
        /* set to -240 to offset Sidebar "drawerWidth" in SidePanel.tsx */
        marginLeft: `-240px`,
        marginRight: `0px`,
        backgroundColor: 'rgba(29, 30, 32, 0.6)',
    });

    return (
        <ThemeProvider theme={theme}>
        {/* Main Page Layout */}
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppToolbar />
                <SidePanel />
                <Box sx={getContainerStyles()}>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'left' }}>
                        <Toolbar />
                        <QuerySummaryText />
                        <Module sectionKey={'sra'} />
                        <Module sectionKey={'palmdb'} />
                        <Module sectionKey={'context'} />
                    </Box>
                </Box>
                <QueryView />
            </Box>
            <Footer />
        </ThemeProvider>
    );
};

export default AppWrapper;
