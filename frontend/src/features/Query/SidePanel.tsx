import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveModule, selectActiveModule } from '../../app/slice.ts';
import { moduleConfig, sectionToModules } from '../Explore/constants.ts';

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

    const onItemClick = (item: string) => {
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
            {['SRA Project', 'Virus', 'Environment', 'Host'].map((item) => (
                <>
                    <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                        {item}
                    </Typography>
                    <MenuList dense>
                        {sectionToModules[item].map((module) => (
                            <MenuItem
                                key={module}
                                selected={activeModule === module}
                                onClick={() => onItemClick(module)}
                            >
                                <ListItemText inset>{moduleConfig[module].title}</ListItemText>
                            </MenuItem>
                        ))}
                    </MenuList>
                </>
            ))}
        </Drawer>
    );
};

export default SidePanel;
