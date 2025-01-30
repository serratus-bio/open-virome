import React from 'react';
import { useLazyGetSummaryTextQuery } from '../../api/client.ts';
import { formatLLMGeneratedText } from './textFormatting.tsx';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import GenerateButton from './GenerateButton.tsx';

import { useSelector } from 'react-redux';
import { selectAllFilters } from '../Query/slice.ts';
import { useGetResultQuery, useGetCountsQuery } from '../../api/client.ts';
import { moduleConfig } from '../Module/constants.ts';
import { isSummaryView } from '../../common/utils/plotHelpers.ts';
import { handleIdKeyIrregularities } from '../../common/utils/queryHelpers.ts';
import { useState } from 'react';
import cytoscape from 'cytoscape';
import { shouldDisableFigureView, isSimpleLayout } from '../../common/utils/plotHelpers.ts';

const GenerateSummary = ({ identifiers, dataType, palmprintOnly }) => {
     // figure data
     const viromeFigureData = (identifiers) => {
        const allFilters = useSelector(selectAllFilters);
        const [randomized, setRandomized] = useState(0);
        const [activeSubgraph, setActiveSubgraph] = useState('1');
        const [isSummaryTableOpen, setIsSummaryTableOpen] = useState(false);
        const [selectedNetworkItem, setSelectedNetworkItem] = useState(null);
        const [activeModule, setActiveModule] = useState('species');
        const [headlessCy, setHeadlessCy] = useState(
            cytoscape({
                headless: true,
                elements: [],
            }),
        );
        const containerRef = React.useRef(null);
    
        const {
            data: resultData,
            error: resultError,
            isFetching: resultIsFetching,
        } = useGetResultQuery(
            {
                idColumn: moduleConfig[activeModule].resultsIdColumn,
                ids: identifiers
                    ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].single
                    : [],
                idRanges: identifiers
                    ? identifiers[handleIdKeyIrregularities(moduleConfig[activeModule].resultsIdColumn)].range
                    : [],
                table: moduleConfig[activeModule].resultsTable,
                pageStart: 0,
                pageEnd: isSummaryView(identifiers) ? 100 : undefined,
                sortBy: isSummaryView(identifiers) ? 'gb_pid' : undefined,
            },
            {
                skip: !identifiers,
            },
        );
    
        const getFilteredResultData = () => {
            // If virome filters are applied, we only want to plot data that matches the filters
            // (i.e. exclude all other viruses that co-occur in the matching runs)
            if (allFilters.length === 0 || !resultData) {
                return resultData;
            }
    
            const familyFilters = allFilters.filter((filter) => filter.filterType === 'family');
            const speciesFilters = allFilters.filter((filter) => filter.filterType === 'species');
            const sotuFilters = allFilters.filter((filter) => filter.filterType === 'sotu');
    
            let filteredData = resultData;
            if (familyFilters.length > 0) {
                filteredData = filteredData.filter((row) => {
                    return familyFilters.some((filter) => row['tax_family'] === filter.filterValue);
                });
            }
    
            if (speciesFilters.length > 0) {
                filteredData = filteredData.filter((row) => {
                    return speciesFilters.some((filter) => row['tax_species'] === filter.filterValue);
                });
            }
    
            if (sotuFilters.length > 0) {
                filteredData = filteredData.filter((row) => {
                    return sotuFilters.some((filter) => row['sotu'] === filter.filterValue);
                });
            }
            return filteredData;
        };
        return getFilteredResultData();
    }

    const hostFigureData = (identifiers, sectionLayout, palmprintOnly) => {
        const {
            data: tissueCountData,
            error: hostCountError,
            isFetching: tissueCountIsFetching,
        } = useGetCountsQuery(
            {
                idColumn: moduleConfig['tissue'].resultsIdColumn,
                ids: identifiers ? identifiers[moduleConfig['tissue'].resultsIdColumn].single : [],
                idRanges: identifiers ? identifiers[moduleConfig['tissue'].resultsIdColumn].range : [],
                groupBy: moduleConfig['tissue'].groupByKey,
                table: moduleConfig['tissue'].resultsTable,
                palmprintOnly,
            },
            {
                skip: shouldDisableFigureView(identifiers),
            },
        );
    
        const {
            data: diseaseCountData,
            error: diseaseCountError,
            isFetching: diseaseCountIsFetching,
        } = useGetCountsQuery(
            {
                idColumn: moduleConfig['disease'].resultsIdColumn,
                ids: identifiers ? identifiers[moduleConfig['disease'].resultsIdColumn].single : [],
                idRanges: identifiers ? identifiers[moduleConfig['disease'].resultsIdColumn].range : [],
                groupBy: moduleConfig['disease'].groupByKey,
                table: moduleConfig['disease'].resultsTable,
                palmprintOnly,
            },
            {
                skip: shouldDisableFigureView(identifiers),
            },
        );
    
        const {
            data: organismCountData,
            error: organismCountError,
            isFetching: organismCountIsFetching,
        } = useGetCountsQuery(
            {
                idColumn: moduleConfig['statOrganism'].resultsIdColumn,
                ids: identifiers ? identifiers[moduleConfig['statOrganism'].resultsIdColumn].single : [],
                idRanges: identifiers ? identifiers[moduleConfig['statOrganism'].resultsIdColumn].range : [],
                groupBy: moduleConfig['statOrganism'].groupByKey,
                table: moduleConfig['statOrganism'].resultsTable,
                palmprintOnly,
            },
            {
                skip: shouldDisableFigureView(identifiers) || isSimpleLayout(sectionLayout),
            },
        );
    
        const {
            data: sexCountData,
            error: sexCountError,
            isFetching: sexCountIsFetching,
        } = useGetCountsQuery(
            {
                idColumn: moduleConfig['sex'].resultsIdColumn,
                ids: identifiers ? identifiers[moduleConfig['sex'].resultsIdColumn].single : [],
                idRanges: identifiers ? identifiers[moduleConfig['sex'].resultsIdColumn].range : [],
                groupBy: moduleConfig['sex'].groupByKey,
                table: moduleConfig['sex'].resultsTable,
                palmprintOnly,
            },
            {
                skip: shouldDisableFigureView(identifiers) || isSimpleLayout(sectionLayout),
            },
        );
        return {
            tissueCountData,
            diseaseCountData,
            organismCountData,
            sexCountData
        };
    }
    var dataObj = {};
    switch (dataType) {
        case 'sra':
            dataType = 'bioproject'; 
            break;
        case 'palmdb':
            dataType = 'virome';
            dataObj = viromeFigureData(identifiers);
            break;
        case 'ecology': // stays the same
            dataType = 'ecology';
            // idk what the data here is
            break;
        case 'host':
            dataType = 'host';
            dataObj = hostFigureData(identifiers, "simple", palmprintOnly);
            break;
        default:
            dataType = ''; // throw err
    }
    const [getSummaryText, { data: summaryData, isFetching: isFetchingSummary, error: errorSummary }] =
        useLazyGetSummaryTextQuery();

    const onButtonClick = async () => {
        if (isFetchingSummary) {
            return;
        }
        await getSummaryText(
            {
                idColumn: dataType,
                ids: identifiers ? identifiers['bioproject'].single : [],
                dataObj: dataObj,
            },
            true,
        );
    };

    const renderPlaceholder = () => {
        if (isFetchingSummary) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const summaryTextIsNonEmpty = () => summaryData && summaryData?.text?.length > 0;

    return (
        <Box
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}
        >
            <GenerateButton onButtonClick={onButtonClick} title={'Generate Summary'} />
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    justifyItems: 'flex-start',
                    height: summaryTextIsNonEmpty() || isFetchingSummary ? '100%' : 0,
                    mb: summaryTextIsNonEmpty() || isFetchingSummary ? 4 : 0,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minWidth: '90%',
                        maxHeight: 300,
                    }}
                >
                    {renderPlaceholder()}
                    {!isFetchingSummary && summaryTextIsNonEmpty() ? (
                        <Box
                            sx={{
                                backgroundColor: '#484848',
                                p: 2,
                                borderRadius: 2,
                                overflow: 'auto',
                                colorScheme: 'dark',
                                maxHeight: 300,
                            }}
                        >
                            <Typography variant='body' sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap' }}>
                                {formatLLMGeneratedText(summaryData?.text, summaryData?.conversation)}
                            </Typography>
                        </Box>
                    ) : null}
                </Box>
            </Box>
        </Box>
    );
};

export default GenerateSummary;
