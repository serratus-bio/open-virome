import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveModule } from '../../app/slice.ts';
import { sectionConfig } from './constants.ts';

import Module from './Module.tsx';
import Box from '@mui/material/Box';

const ExploreView = () => {
    const activeModule = useSelector(selectActiveModule);
    const activeSection = Object.keys(sectionConfig).find((section) =>
        sectionConfig[section].modules.includes(activeModule),
    );

    const sectionRefs = {
        'SRA Run': useRef(),
        'Virus family': useRef(),
        'Palmdb': useRef(),
        'Environment': useRef(),
        'Other': useRef(),
    };

    useEffect(() => {
        const activeSection = Object.keys(sectionConfig).find((section) =>
            sectionConfig[section].modules.includes(activeModule),
        );

        if (!activeSection) {
            return;
        }
        if (activeSection === 'SRA Run') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const sectionRef = sectionRefs[activeSection].current;
            const pos = sectionRef.style.position;
            const top = sectionRef.style.top;
            sectionRef.style.position = 'relative';
            sectionRef.style.top = '-80px';
            sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sectionRef.style.top = top;
            sectionRef.style.position = pos;
        }
    }, [activeModule, sectionRefs]);

    return (
        <>
            <Box key={activeSection} ref={sectionRefs[activeSection]}>
                <Module sectionKey={activeSection} />
            </Box>
        </>
    );
};

export default ExploreView;
