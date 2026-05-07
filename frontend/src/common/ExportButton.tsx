import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';

interface ExportButtonProps {
    onClick: () => void;
    tooltip?: string;
    size?: 'small' | 'medium' | 'large';
}

const ExportButton = ({ onClick, tooltip = 'Download', size = 'small' }: ExportButtonProps) => (
    <Tooltip title={tooltip}>
        <IconButton onClick={onClick} size={size} sx={{ color: '#666' }}>
            <DownloadIcon fontSize={size} />
        </IconButton>
    </Tooltip>
);

export default ExportButton;
