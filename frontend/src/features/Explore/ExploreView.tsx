import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModule } from '../../app/slice.ts';
import { moduleConfig, sectionToModules } from './constants.ts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Module from './Module.tsx';

const ExploreView = () => {
    const activeModule = useSelector(selectActiveModule);
    const activeSection = Object.keys(sectionToModules).find((section) =>
        sectionToModules[section].includes(activeModule),
    );
    const sectionRefs = {
        family: {
            ...moduleConfig['family'],
            ref: useRef(),
        },
        palmdb: {
            ...moduleConfig['palmdb'],
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
        // temp: remove this if revert to full page
        if (true) {
            return;
        }
        const section = sectionRefs[activeModule].ref.current;
        if (!section) {
            return;
        }

        if (sectionRefs[activeModule].title === 'Family') {
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

    return (
        <Box sx={{ maxWidth: '70vw' }}>
            <Typography component={'div'} variant='h4'>
                {activeSection}
            </Typography>
            <Divider />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                {sectionToModules[activeSection].map((module) => (
                    <Box sx={{ mr: 4 }} key={module}>
                        <Module domRef={sectionRefs[module].ref} sectionKey={module} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ExploreView;
