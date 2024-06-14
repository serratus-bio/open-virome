import { useSelector, useDispatch } from 'react-redux';
import { selectActiveView, setActiveView } from './slice.ts';
import { styled } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import FilterTags from '../features/Query/FilterTags.tsx';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface StyledTabProps {
    label: string;
}

interface StyledTabsProps {
    children?: React.ReactNode;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
    <Tabs {...props} TabIndicatorProps={{ children: <span className='MuiTabs-indicatorSpan' /> }} />
))({
    '& .MuiTabs-indicator': {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    '& .MuiTabs-indicatorSpan': {
        maxWidth: 40,
        width: '100%',
        backgroundColor: '#635ee7',
    },
});

const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(({ theme }) => ({
    'textTransform': 'none',
    'fontWeight': theme.typography.fontWeightRegular,
    'fontSize': theme.typography.pxToRem(14),
    'marginRight': theme.spacing(1),
    'color': 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
        color: '#fff',
    },
    '&.Mui-focusVisible': {
        backgroundColor: 'rgba(100, 95, 228, 0.32)',
    },
}));

const AppToolbar = () => {
    const drawerWidth = 240;
    const dispatch = useDispatch();
    const activeView = useSelector(selectActiveView);

    const activeViewMap = {
        query: 0,
        explore: 1,
        tasks: 2,
    };
    const onItemClick = (item: number) => {
        const activeView = Object.keys(activeViewMap).find((key) => activeViewMap[key] === item);
        dispatch(setActiveView(activeView));
    };

    return (
        <AppBar position='fixed' sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
            <Toolbar>
                <StyledTabs
                    value={activeViewMap[activeView]}
                    onChange={(event, newValue) => onItemClick(newValue)}
                    aria-label='styled tabs example'
                >
                    <StyledTab label='Query' />
                    <StyledTab label='Explore' />
                    <StyledTab label='Tasks' />
                </StyledTabs>
                <FilterTags />
            </Toolbar>
        </AppBar>
    );
};

export default AppToolbar;
