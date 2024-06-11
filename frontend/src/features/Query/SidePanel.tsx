import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveModule, selectActiveModule } from '../../app/slice.ts';
import { moduleConfig } from '../Explore/constants.ts';

import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const SidePanel = () => {
    const dispatch = useDispatch();

    const activeModule = useSelector(selectActiveModule);

    const handleItemClick = (item: string) => {
        dispatch(setActiveModule(item));
    };

    const drawerWidth = 240;
    return (
        <Drawer
            variant='permanent'
            open={true}
            sx={{
                'width': drawerWidth,
                'flexShrink': 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: 'rgb(40, 40, 40)',
                },
            }}
        >
            <Toolbar />
            <Divider />
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Virus
            </Typography>
            <MenuList dense>
                {['family', 'palmdb'].map((item) => (
                    <MenuItem key={item} selected={activeModule === item} onClick={() => handleItemClick(item)}>
                        <ListItemText inset>{moduleConfig[item].title}</ListItemText>
                    </MenuItem>
                ))}
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Environment
            </Typography>
            <MenuList dense>
                {['geography', 'ecology'].map((item) => (
                    <MenuItem key={item} selected={activeModule === item} onClick={() => handleItemClick(item)}>
                        <ListItemText inset>{moduleConfig[item].title}</ListItemText>
                    </MenuItem>
                ))}
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Host
            </Typography>
            <MenuList dense>
                {['host', 'statHost', 'tissue'].map((item) => (
                    <MenuItem key={item} selected={activeModule === item} onClick={() => handleItemClick(item)}>
                        <ListItemText inset>{moduleConfig[item].title}</ListItemText>
                    </MenuItem>
                ))}
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Project Info
            </Typography>
            <MenuList dense>
                {['bioproject', 'date'].map((item) => (
                    <MenuItem key={item} selected={activeModule === item} onClick={() => handleItemClick(item)}>
                        <ListItemText inset>{moduleConfig[item].title}</ListItemText>
                    </MenuItem>
                ))}
            </MenuList>
        </Drawer>
    );
};

export default SidePanel;
