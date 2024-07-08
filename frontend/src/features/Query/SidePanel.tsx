import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveModule, selectActiveModule } from '../../app/slice.ts';
import { moduleConfig, sectionConfig } from '../Module/constants.ts';

import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

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
            {Object.keys(sectionConfig).map((item) => (
                <Box key={item}>
                    <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                        {item}
                    </Typography>
                    <MenuList dense>
                        {sectionConfig[item].modules.map((module) => (
                            <MenuItem
                                key={module}
                                selected={activeModule === module}
                                onClick={() => onItemClick(module)}
                            >
                                <ListItemText inset>{moduleConfig[module].title}</ListItemText>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Box>
            ))}
        </Drawer>
    );
};

export default SidePanel;
