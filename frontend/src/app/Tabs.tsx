import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveView } from './slice.ts';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import QueryView from '../features/Query/QueryView.tsx';
import ExploreView from '../features/Explore/ExploreView.tsx';
import TasksView from '../features/Tasks/TasksView.tsx';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'div'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const Tabs = () => {
    const activeView = useSelector(selectActiveView);

    const activeViewMap = {
        query: 0,
        explore: 1,
        tasks: 2,
    };

    return (
        <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Box>
                <TabPanel value={activeViewMap[activeView]} index={0}>
                    <QueryView />
                </TabPanel>
                <TabPanel value={activeViewMap[activeView]} index={1}>
                    <ExploreView />
                </TabPanel>
                <TabPanel value={activeViewMap[activeView]} index={2}>
                    <TasksView />
                </TabPanel>
            </Box>
        </Box>
    );
};

export default Tabs;
