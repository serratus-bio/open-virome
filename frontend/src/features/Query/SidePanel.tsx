import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveModule, selectActiveModule } from '../../app/slice.ts';

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
                <MenuItem selected={activeModule === 'phylum'} onClick={() => handleItemClick('phylum')}>
                    <ListItemText inset>Phylum</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'family'} onClick={() => handleItemClick('family')}>
                    <ListItemText inset>Family</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'palmprint'} onClick={() => handleItemClick('palmprint')}>
                    <ListItemText inset>RdRP Palmprint</ListItemText>
                </MenuItem>
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Ecology
            </Typography>
            <MenuList dense>
                <MenuItem selected={activeModule === 'geography'} onClick={() => handleItemClick('geography')}>
                    <ListItemText inset>Geography</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'ecology'} onClick={() => handleItemClick('ecology')}>
                    <ListItemText inset>Ecological zone</ListItemText>
                </MenuItem>
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Host
            </Typography>
            <MenuList dense>
                <MenuItem selected={activeModule === 'host'} onClick={() => handleItemClick('host')}>
                    <ListItemText inset>Organism label</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'statHost'} onClick={() => handleItemClick('statHost')}>
                    <ListItemText inset>STAT Host</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'tissue'} onClick={() => handleItemClick('tissue')}>
                    <ListItemText inset>Tissue</ListItemText>
                </MenuItem>
            </MenuList>
            <Typography sx={{ mt: 2, ml: 2 }} variant='h6' component='div'>
                Sample
            </Typography>
            <MenuList dense>
                <MenuItem selected={activeModule === 'bioproject'} onClick={() => handleItemClick('bioproject')}>
                    <ListItemText inset>Bioproject</ListItemText>
                </MenuItem>
                <MenuItem selected={activeModule === 'date'} onClick={() => handleItemClick('date')}>
                    <ListItemText inset>Collection date</ListItemText>
                </MenuItem>
            </MenuList>
        </Drawer>
    );
};

export default SidePanel;
