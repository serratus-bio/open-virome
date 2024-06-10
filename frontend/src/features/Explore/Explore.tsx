import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModule } from '../../app/slice.ts';
import { moduleConfig } from './constants.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Module from './Module.tsx';

const Explore = () => {
    const activeModule = useSelector(selectActiveModule);
    const sectionRefs = {
        phylum: {
            ...moduleConfig['phylum'],
            ref: useRef(),
        },
        family: {
            ...moduleConfig['family'],
            ref: useRef(),
        },
        palmprint: {
            ...moduleConfig['palmprint'],
            ref: useRef(),
        },
        date: {
            ...moduleConfig['date'],
            ref: useRef(),
        },
        bioproject: {
            ...moduleConfig['bioproject'],
            ref: useRef(),
        },
        geography: {
            ...moduleConfig['geography'],
            ref: useRef(),
        },
        ecology: {
            ...moduleConfig['ecology'],
            ref: useRef(),
        },
        tissue: {
            ...moduleConfig['tissue'],
            ref: useRef(),
        },
        host: {
            ...moduleConfig['host'],
            ref: useRef(),
        },
        statHost: {
            ...moduleConfig['statHost'],
            ref: useRef(),
        },
    };

    useEffect(() => {
        const section = sectionRefs[activeModule].ref.current;
        if (!section) {
            return;
        }

        if (sectionRefs[activeModule].title === 'Phylum') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const pos = section.style.position;
            const top = section.style.top;
            section.style.position = 'relative';
            section.style.top = '-80px';
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.style.top = top;
            section.style.position = pos;
        }
    }, [activeModule, sectionRefs]);

    const sectionStyle = {
        mt: 2,
        mb: 2,
    };

    return (
        <Box sx={{ maxWidth: '70vw' }}>
            <Box sx={sectionStyle}>
                <Typography component={'div'} variant='h4'>
                    Virus
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {['phylum', 'family', 'palmprint'].map((sectionKey) => (
                        <Module key={sectionKey} domRef={sectionRefs[sectionKey].ref} sectionKey={sectionKey} />
                    ))}
                </Box>
            </Box>
            <Box sx={sectionStyle}>
                <Typography component={'div'} variant='h4'>
                    Ecology
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {['geography', 'ecology'].map((sectionKey) => (
                        <Module key={sectionKey} domRef={sectionRefs[sectionKey].ref} sectionKey={sectionKey} />
                    ))}
                </Box>
            </Box>
            <Box sx={sectionStyle}>
                <Typography component={'div'} variant='h4'>
                    Host
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {['host', 'statHost', 'tissue'].map((sectionKey) => (
                        <Module key={sectionKey} domRef={sectionRefs[sectionKey].ref} sectionKey={sectionKey} />
                    ))}
                </Box>
            </Box>
            <Box sx={sectionStyle}>
                <Typography component={'div'} variant='h4'>
                    Sample
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {['bioproject', 'date'].map((sectionKey) => (
                        <Module key={sectionKey} domRef={sectionRefs[sectionKey].ref} sectionKey={sectionKey} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default Explore;
