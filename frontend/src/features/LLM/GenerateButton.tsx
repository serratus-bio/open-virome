
import React from 'react';
import IconButton from '@mui/material/IconButton';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import Tooltip from '@mui/material/Tooltip';

export const GenerateButton = ({ onButtonClick, title }) => (
    <Tooltip title={title} placement='bottom'>
        <IconButton style={{ backgroundColor: 'rgba(86, 86, 86, 0.4)' }} onClick={onButtonClick}>
            <BlurOnIcon
                style={{
                    color: '#9be3ef',
                    fontSize: 30,
                }}
            />
        </IconButton>
    </Tooltip>
);