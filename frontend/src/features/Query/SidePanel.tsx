import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveQueryModule, toggleSidebar, selectSidebarOpen, selectActiveQueryModule } from '../../app/slice.ts';
import { moduleConfig, sectionConfig } from '../Module/constants.ts';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const SidePanel = () => {
    const dispatch = useDispatch();
    const sidebarOpen = useSelector(selectSidebarOpen);
    const activeModule = useSelector(selectActiveQueryModule);

    const onItemClick = (moduleKey: string) => {
        dispatch(setActiveQueryModule(moduleKey));
    };

    const drawerWidth = 240;

    const handleDrawerClose = () => {
        dispatch(toggleSidebar());
    };

    return (
        <Drawer
            open={sidebarOpen}
            anchor={'left'}
            variant='persistent'
            sx={{
                'zIndex': sidebarOpen ? 1400 : -1,
                'width': drawerWidth,
                'flexShrink': 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: 'rgb(40, 40, 40)',
                    border: 'none',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon fontSize='large' />
                </IconButton>
            </Box>
            {Object.keys(sectionConfig).map((sectionKey) => (
                <Box key={sectionKey}>
                    <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                        {sectionConfig[sectionKey].title}
                    </Typography>
                    <MenuList dense>
                        {sectionConfig[sectionKey].modules.map((moduleKey) => (
                            <MenuItem
                                key={moduleKey}
                                onClick={() => onItemClick(moduleKey)}
                                selected={moduleKey === activeModule}
                            >
                                <ListItemText inset>{moduleConfig[moduleKey].title}</ListItemText>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Box>
            ))}
        </Drawer>
    );
};

export default SidePanel;
