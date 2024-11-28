import React from 'react';
import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Tooltip from '@mui/material/Tooltip';
import { load } from '@fingerprintjs/botd';

const GenerateButton = ({ onButtonClick, title }) => {
    const onClick = async () => {
        try {
            const botd = await load();
            const detect = await botd.detect();
            if (!detect || detect.bot === true) {
                throw new Error('Bot detected');
            }
            onButtonClick();
        } catch (error) {
            console.error(error);
        }
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
