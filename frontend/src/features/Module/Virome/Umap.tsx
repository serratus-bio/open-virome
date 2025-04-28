import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectAllFilters } from '../../Query/slice.ts'
import { useGetIdentifiersQuery, useLazyGetUmapResultsQuery } from '../../../api/client.ts';
import { getFilterQuery } from '../../../common/utils/queryHelpers.ts'
import { UMAP } from 'umap-js';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ScatterPlot from '../../../common/ScatterPlot.tsx';

const createSeededRandom = (seed) => {
    let m = 0x80000000, a = 1103515245, c = 12345;
    let random = () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
    return random;
}

const Umap = ({ identifiers, virusFamilies, palmprintOnly }) => {
    const selectedFilters = useSelector(selectAllFilters)
    const filterQuery = getFilterQuery({ filters: selectedFilters })
    const [umapProjection, setUmapProjection] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        data: identifiersData,
        error: identifiersError,
        isFetching: identifiersFetching,
    } = useGetIdentifiersQuery({
        filters: filterQuery,
        palmprintOnly,
        maxRetries: 3,
    });

    const [getUmapData, { data: umapData, error: umapError, isFetching: umapFetching }] =
        useLazyGetUmapResultsQuery();

    useEffect(() => {
        if (identifiersData) {
            getUmapData({
                idColumn: 'bioproject',
                ids: identifiersData ? identifiersData['bioproject'].single : [],
                idRanges: identifiersData ? identifiersData['bioproject'].range : [],
                filters: filterQuery,
                palmprintOnly,
            });
        }
    }, [identifiersData]);

    useEffect(() => {
        if (umapData && !umapFetching && !isLoading) {
            setIsLoading(true)
        }
        try {
            const uniqueFamilies = new Set()
            const uniqueProjects = new Set()
            const uniqueSpecies = new Set()

            umapData.forEach(node => {
                if (node.virusFamily) uniqueFamilies.add(node.virusFamily);
                uniqueProjects.add(node.bioProject);
                node.taxSpecies.forEach(species => uniqueSpecies.add(species));
            });

            const familyArray = Array.from(uniqueFamilies)
            const projectArray = Array.from(uniqueProjects)
            const speciesArray = Array.from(uniqueSpecies)

            const featureVectors = umapData.map(node => {
                // one hot encoding
                const familyFeatures = familyArray.map(family => node.virusFamily === family ? 1 : 0);
                const projectFeatures = projectArray.map(project => node.bioProject === project ? 1 : 0);
                const speciesFeatures = speciesArray.map(species => node.taxSpecies.includes(species) ? 1 : 0);

                const numericFeatures = [
                    Math.log(node.bioSamples.length + 1),
                    Math.log(node.sotus.length + 1),
                ];

                return [...familyFeatures, ...projectFeatures, ...speciesFeatures, ...numericFeatures];
            });

            const umap = new UMAP({
                nComponents: 2,
                nNeighbors: Math.min(15, Math.max(2, Math.floor(umapData.length / 3))),
                minDist: 0.1,
                spread: 1.0,
                random: createSeededRandom(42),
                // metric: 'euclidean',
                // init: 'spectral',
            });

            const result = umap.fit(featureVectors);
            const umapProjection = umapData.map((node, index) => ({
                x: result[index][0],
                y: result[index][1],
                virusFamily: node.virusFamily || 'Unknown',
                bioProject: node.bioProject,
                species: node.taxSpecies,
                bioSamplesCount: node.bioSamples.length,
                sotuCount: node.sotus.length,
            }));

            setUmapProjection(umapProjection);
        } catch (error) {
            console.error("Error processing UMAP data:", error);
        } finally {
            setIsLoading(false)
        }
    }, [umapData, umapFetching]);

    const renderPlaceholder = () => {
        if (isLoading) {
            return <Skeleton variant='text' width={'100%'} height={60} />;
        }
        return null;
    };

    const plotConfig = useMemo(() => {
        if (!umapProjection) return null;

        // Get max values for scaling
        const maxSotus = Math.max(...umapProjection.map(d => d.sotuCount));
        
        // Create color mapping for virus families
        const uniqueFamilies = [...new Set(umapProjection.map(d => d.virusFamily))];
        const colorPalette = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
            '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5'
        ];
        
        const familyToColor = {};
        uniqueFamilies.forEach((family, i) => {
            familyToColor[family] = colorPalette[i % colorPalette.length];
        });

        console.log("Family to Color Mapping:", familyToColor);
        
        return {
            xAxis: {
                type: 'value',
                name: 'UMAP Dimension 1',
                nameLocation: 'middle',
                nameGap: 30
            },
            yAxis: {
                type: 'value',
                name: 'UMAP Dimension 2',
                nameLocation: 'middle',
                nameGap: 35
            },
            grid: {
                left: '10%',
                right: '7%',
                bottom: '10%',
                top: '10%',
                containLabel: true
            },
            tooltip: {
                formatter: (params) => {
                    const d = params.data;

                    let speciesText;
                    if (Array.isArray(d.species)) {
                        if (d.species.length <= 2) {
                            speciesText = d.species.join(", ");
                        } else {
                            speciesText = `${d.species.slice(0, 2).join(", ")} +${d.species.length - 2} more`;
                        }
                    } else {
                        speciesText = d.species || "Unknown";
                    }
                    return `
                        <div style="font-weight:bold">${d.virusFamily}</div>
                        <div>BioProject: ${d.bioProject}</div>
                        <div>SOTUs: ${d.sotuCount}</div>
                        <div>Samples: ${d.bioSamplesCount}</div>
                        <div>Species: ${speciesText}</div>
                    `;
                }
            },
            legend: {
                data: uniqueFamilies,
                right: 10,
                orient: 'vertical',
                textStyle: {
                    color: 'white'
                },
                show: false
            },
            dataset: {
                dimensions: ['x', 'y', 'bioProject', 'virusFamily', 'bioSamplesCount', 'sotuCount', 'species'],
                source: umapProjection
            },
            series: uniqueFamilies.map(family => ({
                name: family,
                type: 'scatter',
                symbolSize: (params) => {
                    // Size by SOTU count
                    return 5 + (params['sotuCount'] / maxSotus * 15);
                },
                itemStyle: {
                    // color: '#ff7f0e',
                    color: familyToColor[family]
                },
                encode: {
                    x: 'x',
                    y: 'y',
                    tooltip: [0, 1, 2, 3, 4, 5, 6]
                },
                datasetIndex: 0,
                datasetDimension: 3,
                datasetDimensionValues: [family]
            }))
        };
    }, [umapProjection]);

    console.log("Plot Config:", plotConfig);
    console.log("Umap Projection:", umapProjection);

    // Render the component
    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h6" gutterBottom></Typography>
            
            {(umapFetching || isLoading) ? (
                <Skeleton variant="rectangular" width="100%" height={400} />
            ) : umapError ? (
                <Typography color="error">Error loading UMAP data</Typography>
            ) : !umapData ? (
                <Typography>No data available for UMAP visualization</Typography>
            ) : !umapProjection ? (
                <Typography>Processing UMAP projection...</Typography>
            ) : (
                <ScatterPlot plotData={plotConfig} styles={{ width: '100%', height: '70vh', maxWidth: '100%' }} />
            )}
        </Box>
    );
};

export default Umap