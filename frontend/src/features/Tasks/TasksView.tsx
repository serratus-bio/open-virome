import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const TasksView = () => {
    return (
        <Box>
            <Typography component={'div'} variant='h4' sx={{ mt: 2, mb: 2 }}>
                Tasks
            </Typography>
        </Box>
    );
};

export default TasksView;
