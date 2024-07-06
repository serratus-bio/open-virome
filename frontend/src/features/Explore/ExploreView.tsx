import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveSection } from '../../app/slice.ts';

import Module from './Module.tsx';
import Box from '@mui/material/Box';

const ExploreView = () => {
    const activeSection = useSelector(selectActiveSection);

    const sectionRefs = {
        'SRA Experiment': useRef(),
        'Palmdb Virome': useRef(),
        'Context': useRef(),
    };

    useEffect(() => {
        if (!activeSection) {
            return;
        }
        if (activeSection === 'SRA Experiment') {
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
    }, [activeSection, sectionRefs]);

    return (
        <>
            <Box key={activeSection} ref={sectionRefs[activeSection]}>
                <Module />
            </Box>
        </>
    );
};

export default ExploreView;
