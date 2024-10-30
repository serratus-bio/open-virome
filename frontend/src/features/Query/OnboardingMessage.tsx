import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../app/slice.ts';
import { addManyFilters } from './slice.ts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import LabelIcon from '@mui/icons-material/Description';
import BrainIcon from '@mui/icons-material/Diversity2';
import GeoIcon from '@mui/icons-material/TravelExplore';
import Logo from '../../common/assets/ov_hex_dark.png';

const OnbaordingMessage = () => {
    const dispatch = useDispatch();

    const exampleFilters = {
        Eimeria: [
            {
                filterId: 'label-Eimeria stiedai',
                filterType: 'label',
                filterValue: 'Eimeria stiedai',
            },
            {
                filterId: 'label-Eimeria maxima',
                filterType: 'label',
                filterValue: 'Eimeria maxima',
            },
            {
                filterId: 'label-Eimeria necatrix',
                filterType: 'label',
                filterValue: 'Eimeria necatrix',
            },
            {
                filterId: 'label-Eimeria tenella',
                filterType: 'label',
                filterValue: 'Eimeria tenella',
            },
            {
                filterId: 'label-Eimeria falciformis',
                filterType: 'label',
                filterValue: 'Eimeria falciformis',
            },
        ],
        Neuronal: [
            {
                filterId: 'tissue-neuronal',
                filterType: 'tissue',
                filterValue: 'neuronal',
            },
            {
                filterId: 'tissue-neuronal stem cell',
                filterType: 'tissue',
                filterValue: 'neuronal stem cell',
            },
            {
                filterId: 'tissue-neuronal cell',
                filterType: 'tissue',
                filterValue: 'neuronal cell',
            },
            {
                filterId: 'tissue-neuronal precursor',
                filterType: 'tissue',
                filterValue: 'neuronal precursor',
            },
            {
                filterId: 'tissue-neuronal cell line',
                filterType: 'tissue',
                filterValue: 'neuronal cell line',
            },
            {
                filterId: 'tissue-neuronal stem',
                filterType: 'tissue',
                filterValue: 'neuronal stem',
            },
            {
                filterId: 'tissue-neuronal precursor cell',
                filterType: 'tissue',
                filterValue: 'neuronal precursor cell',
            },
        ],
        Tundra: [
            {
                filterId: 'biome-WWF_TEW_BIOME_11',
                filterType: 'biome',
                filterValue: 'WWF_TEW_BIOME_11',
            },
        ],
    };

    const onClickFilterText = () => {
        dispatch(toggleSidebar());
    };

    const onClickExampleFilter = (name) => {
        const filters = exampleFilters[name];
        dispatch(addManyFilters(filters));
    };

    const getExampleFilter = (name) => {
        const iconMap = {
            Eimeria: <LabelIcon fontSize='medium' sx={{ mb: 2 }} />,
            Neuronal: <BrainIcon fontSize='medium' sx={{ mb: 2 }} />,
            Tundra: <GeoIcon fontSize='medium' sx={{ mb: 2, mt: 0 }} />,
        };

        const filterTypeMap = {
            Eimeria: 'run label',
            Neuronal: 'tissue metadata',
            Tundra: 'geography metadata',
        };

        return (
            <Card
                sx={{
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.48)',
                    borderRadius: 8,
                    margin: 2,
                }}
            >
                <CardActionArea
                    onClick={() => onClickExampleFilter(name)}
                    sx={{
                        padding: 2,
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.48)',
                        borderRadius: 8,
                        borderStyle: 'solid',
                        height: 150,
                        width: 225,
                    }}
                >
                    {iconMap[name]}
                    <Typography variant='body1'>
                        {`Query the `}
                        <Typography component='span' fontStyle='italic'>
                            {name}
                        </Typography>
                        {` virome by ${filterTypeMap[name]}`}
                    </Typography>
                </CardActionArea>
            </Card>
        );
    };

    return (
        <Box
            sx={{
                height: '90vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                alt='Open virome logo'
                component='img'
                sx={{
                    height: 150,
                    width: 150,
                    cursor: 'pointer',
                    mt: -20,
                }}
                src={Logo}
                onClick={onClickFilterText}
            />
            <Typography variant='h6'>{`Welcome to Open Virome.`}</Typography>
            <Typography variant='h6'>
                <Typography
                    onClick={onClickFilterText}
                    paragraph
                    variant='h6'
                    component='span'
                    color='primary'
                    style={{ cursor: 'pointer' }}
                >
                    {`Add filters`}
                </Typography>
                {` or click an example below.`}
            </Typography>
            <Box
                sx={{
                    backgroundColor: 'transparent',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 8,
                }}
            >
                {getExampleFilter('Eimeria')}
                {getExampleFilter('Neuronal')}
                {getExampleFilter('Tundra')}
            </Box>
        </Box>
    );
};

export default OnbaordingMessage;
