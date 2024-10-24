import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetIdentifiersQuery } from '../../api/client.ts';
import { formatNumber } from '../../common/utils/textFormatting.ts';
import { selectAllFilters, addFilter, removeFilter } from './slice.ts';
import { selectActiveQueryModule } from '../../app/slice.ts';
import { getFilterQuery } from '../../common/utils/queryHelpers.ts';
import { moduleConfig } from '../Module/constants.ts';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormHelperText from '@mui/material/FormHelperText';
import QuerySummaryText from './QuerySummaryText.tsx';

const SRAIdsInput = () => {
    const dispatch = useDispatch();
    const [isTypingInterval, setIsTypingInterval] = useState(0);
    const activeQueryModule = useSelector(selectActiveQueryModule);
    const filters = useSelector(selectAllFilters);

    const getIdStringFromFilters = () => {
        const idFilters = filters.filter((filter) => filter.filterType === activeQueryModule);
        if (idFilters.length > 0) {
            return idFilters.map((filter) => filter.filterValue).join(', ');
        }
        return '';
    };
    const [inputIdString, setInputIdString] = useState(getIdStringFromFilters());

    useEffect(() => {
        const isTypingDelay = setTimeout(async () => {
            setIsTypingInterval(0);
        }, 500);
        return () => clearTimeout(isTypingDelay);
    }, [isTypingInterval]);

    const getIdentifierKey = () => {
        const mapping = {
            runId: 'run',
            bioproject: 'bioproject',
            biosample: 'biosample',
        };
        return mapping[activeQueryModule];
    };

    const deserializeIdInput = (input, delimiter = /[,\s]/) => {
        if (!input || input.length === 0) {
            return [];
        }
        return input
            .split(delimiter)
            .map((accession) => accession.trim())
            .filter(Boolean);
    };

    const getIdListFromInput = () => {
        const idsList = deserializeIdInput(inputIdString);
        return [...new Set(idsList)];
    };

    const buildIdFilters = () => {
        return getIdListFromInput().map((id) => ({
            filterType: activeQueryModule,
            filterValue: id,
            groupByKey: moduleConfig[activeQueryModule].groupByKey,
        }));
    };

    const getMissingIdList = () => {
        const queriedIds = getIdListFromInput();
        if (queriedIds.length > 0) {
            const matchedIds = identifiersData?.[getIdentifierKey()]?.single ?? [];
            return queriedIds.filter((value) => !matchedIds.includes(value));
        }
        return [];
    };

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery(
        {
            filters: [...buildIdFilters(), ...getFilterQuery({ filters, excludeType: activeQueryModule })],
        },
        {
            skip: isTypingInterval > 0,
        },
    );

    useEffect(() => {
        // Validate if the ids have matches existing in the database
        // Add the matched ids to the filters and remove any that may have been removed from query
        const queriedIds = getIdListFromInput();
        const matchedIds = identifiersData?.[getIdentifierKey()]?.single ?? [];
        const intersection = queriedIds.filter((value) => matchedIds.includes(value));

        const existingIdFilters = filters.filter((filter) => filter.filterType === activeQueryModule);
        const complement = existingIdFilters.filter((filter) => !intersection.includes(filter.filterValue));

        for (const id of intersection) {
            if (!existingIdFilters.find((filter) => filter.filterValue === id)) {
                dispatch(
                    addFilter({
                        filterId: `${activeQueryModule}-${id}`,
                        filterType: activeQueryModule,
                        filterValue: id,
                    }),
                );
            }
        }
        for (const filter of complement) {
            dispatch(removeFilter(filter.filterId));
        }
    }, [identifiersData]);

    const handleIdsChange = (event) => {
        setInputIdString(event.target.value);
        setIsTypingInterval(isTypingInterval + 1);
    };

    const handleFileUpload = (e) => {
        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = (evt) => {
            if (!evt?.target?.result) {
                return;
            }
            const { result } = evt.target;
            setInputIdString(result);
        };
        reader.readAsText(file);
    };

    return (
        <Box sx={{ margin: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                <TextField
                    id='outlined-multiline-static'
                    multiline
                    rows={4}
                    sx={{ backgroundColor: 'rgba(40, 40, 40, 0.3)' }}
                    defaultValue={inputIdString}
                    onChange={(event) => handleIdsChange(event)}
                    helperText={'Enter search terms seperated by comma or whitespace'}
                    label={`Search ${moduleConfig[activeQueryModule].title}`}
                    autoFocus
                />
            </Box>

            {!identifiersFetching && isTypingInterval == 0 && getMissingIdList().length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FormHelperText sx={{ color: '#FFCCCB' }}>
                        {`${getMissingIdList().length} identifiers have no matches (${getMissingIdList().join(', ')}).`}
                    </FormHelperText>
                </Box>
            ) : null}

            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, ml: 1, mb: 4 }}>
                <Typography variant='body2' sx={{ mt: 4, textAlign: 'left', mb: 2 }}>
                    {`Or upload a .txt file with ${moduleConfig[activeQueryModule].title}s`}
                </Typography>
                <Button component='label' variant='outlined' startIcon={<UploadFileIcon />} sx={{ width: 200 }}>
                    Upload File
                    <input type='file' accept='.txt' hidden onChange={handleFileUpload} />
                </Button>
            </Box>
            <Box sx={{ mb: 2, mt: 6 }}>
                <QuerySummaryText />
            </Box>
        </Box>
    );
};

export default SRAIdsInput;
