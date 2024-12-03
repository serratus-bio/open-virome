import React from 'react';
import { isBotDetected } from '../../common/utils/botDetection.ts';

import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Tooltip from '@mui/material/Tooltip';

const GenerateButton = ({ onButtonClick, title }) => {
    const onClick = async () => {
        const isBot = await isBotDetected();
        if (isBot) {
            return;
        }
        onButtonClick();
    };

    return (
        <Tooltip title={title} placement='bottom'>
            <IconButton style={{ backgroundColor: 'rgba(86, 86, 86, 0.4)' }} onClick={onClick}>
                <BlurOnIcon
                    style={{
                        color: '#9be3ef',
                        fontSize: 30,
                    }}
                />
            </IconButton>
        </Tooltip>
    );
};

export default GenerateButton;
