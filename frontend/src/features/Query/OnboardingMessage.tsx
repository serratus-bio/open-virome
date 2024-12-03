import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../app/slice.ts';
import { addManyFilters } from './slice.ts';
import { selectChatMessages } from '../LLM/slice.ts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import LabelIcon from '@mui/icons-material/Description';
import BrainIcon from '@mui/icons-material/Diversity2';
import GeoIcon from '@mui/icons-material/TravelExplore';
import Logo from '../../common/assets/ov_hex_dark.png';
import OnboardingChat from '../LLM/OnboardingChat.tsx';

const OnbaordingMessage = () => {
    const dispatch = useDispatch();
    const chatMessages = useSelector(selectChatMessages);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    const onlyShowGlobalChat = () => {
        if (chatMessages.length === 0) {
            return false;
        }
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage.mode === 'global' && lastMessage.role === 'assistant';
    };

    const getExampleFilter = (name) => {
        const iconMap = {
            Eimeria: <LabelIcon fontSize='medium' />,
            Neuronal: <BrainIcon fontSize='medium' />,
            Tundra: <GeoIcon fontSize='medium' />,
        };

        const filterTypeMap = {
            Eimeria: 'organism',
            Neuronal: 'tissue',
            Tundra: 'biome',
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
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.48)',
                        borderRadius: 8,
                        borderStyle: 'solid',
                        height: 80,
                        width: 200,
                        gap: 1,
                    }}
                >
                    {iconMap[name]}
                    <Typography variant='body' sx={{ textAlign: 'left' }}>
                        {`Query the `}
                        <Typography variant='body' component='span' fontStyle='italic'>
                            {name}
                        </Typography>
                        {` ${filterTypeMap[name]} virome`}
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
            {
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        mt: 4,
                    }}
                >
                    {!onlyShowGlobalChat() ? (
                        <>
                            <Box
                                alt='Open virome logo'
                                component='img'
                                sx={{
                                    height: 150,
                                    width: 150,
                                    cursor: 'pointer',
                                    mt: -10,
                                }}
                                src={Logo}
                                onClick={onClickFilterText}
                            />
                            <Typography
                                variant='h6'
                                onClick={onClickFilterText}
                                sx={{ cursor: 'pointer' }}
                            >{`Welcome to Open Virome`}</Typography>
                        </>
                    ) : null}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: onlyShowGlobalChat() ? '100%' : 100,
                            mt: 4,
                        }}
                    >
                        <OnboardingChat />
                    </Box>

                    {!onlyShowGlobalChat() ? (
                        <Box
                            sx={{
                                backgroundColor: 'transparent',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                mt: 6,
                            }}
                        >
                            {getExampleFilter('Eimeria')}
                            {getExampleFilter('Neuronal')}
                            {getExampleFilter('Tundra')}
                        </Box>
                    ) : null}
                </Box>
            }
        </Box>
    );
};

export default OnbaordingMessage;
