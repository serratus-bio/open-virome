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

const OnbaordingPage = () => {
    const dispatch = useDispatch();

    const exampleFilters = {
        Eimeria: [
            {
                filterId: 'host-Eimeria tenella',
                filterType: 'host',
                filterValue: 'Eimeria tenella',
            },
            {
                filterId: 'host-Eimeria',
                filterType: 'host',
                filterValue: 'Eimeria',
            },
            {
                filterId: 'host-Eimeria maxima',
                filterType: 'host',
                filterValue: 'Eimeria maxima',
            },
            {
                filterId: 'host-Eimeria falciformis',
                filterType: 'host',
                filterValue: 'Eimeria falciformis',
            },
            {
                filterId: 'host-Eimeria tenella strain Houghton',
                filterType: 'host',
                filterValue: 'Eimeria tenella strain Houghton',
            },
            {
                filterId: 'host-Eimeria stiedai',
                filterType: 'host',
                filterValue: 'Eimeria stiedai',
            },
            {
                filterId: 'host-Eimeria necatrix',
                filterType: 'host',
                filterValue: 'Eimeria necatrix',
            },
            {
                filterId: 'host-Eimeria praecox',
                filterType: 'host',
                filterValue: 'Eimeria praecox',
            },
            {
                filterId: 'host-Eimeria mitis',
                filterType: 'host',
                filterValue: 'Eimeria mitis',
            },
            {
                filterId: 'host-Eimeria acervulina',
                filterType: 'host',
                filterValue: 'Eimeria acervulina',
            },
            {
                filterId: 'host-Indigofera lindheimeriana',
                filterType: 'host',
                filterValue: 'Indigofera lindheimeriana',
            },
            {
                filterId: 'host-Ochsenheimeria urella',
                filterType: 'host',
                filterValue: 'Ochsenheimeria urella',
            },
            {
                filterId: 'host-Eimeria brunetti',
                filterType: 'host',
                filterValue: 'Eimeria brunetti',
            },
            {
                filterId: 'host-Eimeria pavonina',
                filterType: 'host',
                filterValue: 'Eimeria pavonina',
            },
            {
                filterId: 'host-Eimeria sp. OTU-X',
                filterType: 'host',
                filterValue: 'Eimeria sp. OTU-X',
            },
            {
                filterId: 'host-Eimeria sp. OTU-Y',
                filterType: 'host',
                filterValue: 'Eimeria sp. OTU-Y',
            },
            {
                filterId: 'host-Eimeria sp. T10_S17',
                filterType: 'host',
                filterValue: 'Eimeria sp. T10_S17',
            },
            {
                filterId: 'host-Eimeria sp. T10_S47',
                filterType: 'host',
                filterValue: 'Eimeria sp. T10_S47',
            },
            {
                filterId: 'host-Eimeria sp. T11_S18',
                filterType: 'host',
                filterValue: 'Eimeria sp. T11_S18',
            },
            {
                filterId: 'host-Eimeria sp. T11_S48',
                filterType: 'host',
                filterValue: 'Eimeria sp. T11_S48',
            },
            {
                filterId: 'host-Eimeria sp. T12_S49',
                filterType: 'host',
                filterValue: 'Eimeria sp. T12_S49',
            },
            {
                filterId: 'host-Eimeria sp. T1_S38',
                filterType: 'host',
                filterValue: 'Eimeria sp. T1_S38',
            },
            {
                filterId: 'host-Eimeria sp. T21_S50',
                filterType: 'host',
                filterValue: 'Eimeria sp. T21_S50',
            },
            {
                filterId: 'host-Eimeria sp. T22_S51',
                filterType: 'host',
                filterValue: 'Eimeria sp. T22_S51',
            },
            {
                filterId: 'host-Eimeria sp. T23_S52',
                filterType: 'host',
                filterValue: 'Eimeria sp. T23_S52',
            },
            {
                filterId: 'host-Eimeria sp. T24_S53',
                filterType: 'host',
                filterValue: 'Eimeria sp. T24_S53',
            },
            {
                filterId: 'host-Eimeria sp. T25_S19',
                filterType: 'host',
                filterValue: 'Eimeria sp. T25_S19',
            },
            {
                filterId: 'host-Eimeria sp. T25_S54',
                filterType: 'host',
                filterValue: 'Eimeria sp. T25_S54',
            },
            {
                filterId: 'host-Eimeria sp. T26_S20',
                filterType: 'host',
                filterValue: 'Eimeria sp. T26_S20',
            },
            {
                filterId: 'host-Eimeria sp. T26_S55',
                filterType: 'host',
                filterValue: 'Eimeria sp. T26_S55',
            },
            {
                filterId: 'host-Eimeria sp. T27_S21',
                filterType: 'host',
                filterValue: 'Eimeria sp. T27_S21',
            },
            {
                filterId: 'host-Eimeria sp. T27_S56',
                filterType: 'host',
                filterValue: 'Eimeria sp. T27_S56',
            },
            {
                filterId: 'host-Eimeria sp. T28_S22',
                filterType: 'host',
                filterValue: 'Eimeria sp. T28_S22',
            },
            {
                filterId: 'host-Eimeria sp. T28_S57',
                filterType: 'host',
                filterValue: 'Eimeria sp. T28_S57',
            },
            {
                filterId: 'host-Eimeria sp. T29_S23',
                filterType: 'host',
                filterValue: 'Eimeria sp. T29_S23',
            },
            {
                filterId: 'host-Eimeria sp. T29_S58',
                filterType: 'host',
                filterValue: 'Eimeria sp. T29_S58',
            },
            {
                filterId: 'host-Eimeria sp. T2_S39',
                filterType: 'host',
                filterValue: 'Eimeria sp. T2_S39',
            },
            {
                filterId: 'host-Eimeria sp. T30_S59',
                filterType: 'host',
                filterValue: 'Eimeria sp. T30_S59',
            },
            {
                filterId: 'host-Eimeria sp. T31_S24',
                filterType: 'host',
                filterValue: 'Eimeria sp. T31_S24',
            },
            {
                filterId: 'host-Eimeria sp. T31_S60',
                filterType: 'host',
                filterValue: 'Eimeria sp. T31_S60',
            },
            {
                filterId: 'host-Eimeria sp. T32_S61',
                filterType: 'host',
                filterValue: 'Eimeria sp. T32_S61',
            },
            {
                filterId: 'host-Eimeria sp. T3_S40',
                filterType: 'host',
                filterValue: 'Eimeria sp. T3_S40',
            },
            {
                filterId: 'host-Eimeria sp. T41_S62',
                filterType: 'host',
                filterValue: 'Eimeria sp. T41_S62',
            },
            {
                filterId: 'host-Eimeria sp. T42_S63',
                filterType: 'host',
                filterValue: 'Eimeria sp. T42_S63',
            },
            {
                filterId: 'host-Eimeria sp. T43_S64',
                filterType: 'host',
                filterValue: 'Eimeria sp. T43_S64',
            },
            {
                filterId: 'host-Eimeria sp. T44_S65',
                filterType: 'host',
                filterValue: 'Eimeria sp. T44_S65',
            },
            {
                filterId: 'host-Eimeria sp. T45_S25',
                filterType: 'host',
                filterValue: 'Eimeria sp. T45_S25',
            },
            {
                filterId: 'host-Eimeria sp. T45_S66',
                filterType: 'host',
                filterValue: 'Eimeria sp. T45_S66',
            },
            {
                filterId: 'host-Eimeria sp. T46_S26',
                filterType: 'host',
                filterValue: 'Eimeria sp. T46_S26',
            },
            {
                filterId: 'host-Eimeria sp. T46_S67',
                filterType: 'host',
                filterValue: 'Eimeria sp. T46_S67',
            },
            {
                filterId: 'host-Eimeria sp. T47_S68',
                filterType: 'host',
                filterValue: 'Eimeria sp. T47_S68',
            },
            {
                filterId: 'host-Eimeria sp. T48_S27',
                filterType: 'host',
                filterValue: 'Eimeria sp. T48_S27',
            },
            {
                filterId: 'host-Eimeria sp. T48_S69',
                filterType: 'host',
                filterValue: 'Eimeria sp. T48_S69',
            },
            {
                filterId: 'host-Eimeria sp. T49_S28',
                filterType: 'host',
                filterValue: 'Eimeria sp. T49_S28',
            },
            {
                filterId: 'host-Eimeria sp. T49_S70',
                filterType: 'host',
                filterValue: 'Eimeria sp. T49_S70',
            },
            {
                filterId: 'host-Eimeria sp. T4_S41',
                filterType: 'host',
                filterValue: 'Eimeria sp. T4_S41',
            },
            {
                filterId: 'host-Eimeria sp. T50_S71',
                filterType: 'host',
                filterValue: 'Eimeria sp. T50_S71',
            },
            {
                filterId: 'host-Eimeria sp. T51_S72',
                filterType: 'host',
                filterValue: 'Eimeria sp. T51_S72',
            },
            {
                filterId: 'host-Eimeria sp. T52_S73',
                filterType: 'host',
                filterValue: 'Eimeria sp. T52_S73',
            },
            {
                filterId: 'host-Eimeria sp. T5_S42',
                filterType: 'host',
                filterValue: 'Eimeria sp. T5_S42',
            },
            {
                filterId: 'host-Eimeria sp. T6_S14',
                filterType: 'host',
                filterValue: 'Eimeria sp. T6_S14',
            },
            {
                filterId: 'host-Eimeria sp. T6_S43',
                filterType: 'host',
                filterValue: 'Eimeria sp. T6_S43',
            },
            {
                filterId: 'host-Eimeria sp. T7_S44',
                filterType: 'host',
                filterValue: 'Eimeria sp. T7_S44',
            },
            {
                filterId: 'host-Eimeria sp. T8_S15',
                filterType: 'host',
                filterValue: 'Eimeria sp. T8_S15',
            },
            {
                filterId: 'host-Eimeria sp. T8_S45',
                filterType: 'host',
                filterValue: 'Eimeria sp. T8_S45',
            },
            {
                filterId: 'host-Eimeria sp. T9_S16',
                filterType: 'host',
                filterValue: 'Eimeria sp. T9_S16',
            },
            {
                filterId: 'host-Eimeria sp. T9_S46',
                filterType: 'host',
                filterValue: 'Eimeria sp. T9_S46',
            },
            {
                filterId: 'host-Eimeria zaria',
                filterType: 'host',
                filterValue: 'Eimeria zaria',
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
                filterId: 'tissue-non neuronal',
                filterType: 'tissue',
                filterValue: 'non neuronal',
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
        Tundra: [],
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
                    backgroundColor: 'transparent',
                    backgroundImage: 'none',
                }}
            >
                <CardActionArea
                    onClick={() => onClickExampleFilter(name)}
                    sx={{
                        backgroundColor: 'rgba(29, 30, 32, 0.6)',
                        padding: 2,
                        margin: 2,
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

export default OnbaordingPage;
