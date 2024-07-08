import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllFilters, removeFilter } from './slice.ts';
import { setActiveModule } from '../../app/slice.ts';
import { moduleConfig } from '../Module/constants.ts';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

const FilterTags = () => {
    const filters = useSelector(selectAllFilters);
    const dispatch = useDispatch();

    const getFilterDisplayText = (filter) => {
        return `${moduleConfig[filter.filterType].tag}: ${filter.filterValue}`;
    };

    const onFilterDelete = (filterId) => {
        dispatch(removeFilter(filterId));
    };

    const onFilterClick = (filterType) => {
        dispatch(setActiveModule(filterType));
    };

    return (
        <Box
            sx={{
                ml: 4,
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'left',
                flexWrap: 'nowrap',
                overflow: 'auto',
                maxWidth: 970,
                borderRadius: 2,
            }}
        >
            <Stack spacing={1} direction='row'>
                {filters.map((filter, index) => (
                    <Chip
                        key={filter.filterId}
                        label={getFilterDisplayText(filter)}
                        onDelete={() => onFilterDelete(filter.filterId)}
                        onClick={() => onFilterClick(filter.filterType)}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default FilterTags;
