import React, { useState, useEffect } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

import CytoscapeComponent from 'react-cytoscapejs';
import Box from '@mui/material/Box';
import DropDownSelect from './DropdownSelect.tsx';

cytoscape.use(fcose);

const NetworkPlot = ({ plotData = [] }) => {
    const [cy, setCy] = useState(null);
    const [activeSubgraph, setActiveSubgraph] = useState(1);
    const [headlessCy, setHeadlessCy] = useState(
        cytoscape({
            headless: true,
            elements: plotData,
        }),
    );

    useEffect(() => {
        if (cy && headlessCy) {
            headlessCy.json({ elements: plotData });
            headlessCy.ready(() => {
                cy.json({ elements: getPlotData() });
                cy.ready(() => {
                    cy.layout({
                        ...layouts[1],
                    }).run();
                });
            });
        }
    }, [plotData, activeSubgraph]);

    useEffect(() => {
        const componentLabels = getComponentOptions();
        if (componentLabels[0] === 'All' && activeSubgraph !== 'All') {
            setActiveSubgraph('All');
        }
    }, [plotData]);

    const stylesheet = [
        {
            selector: 'node[type="sOTU"]',
            style: {
                backgroundColor: 'data(color)',
                label: 'data(label)',
                color: 'white',
                shape: 'hexagon',
                opacity: 0.8,
                width: 30,
                height: 30,
                fontSize: 20,
            },
        },
        {
            selector: 'node[type="run"]',
            style: {
                backgroundColor: 'grey',
                color: 'white',
                shape: 'ellipse',
                opacity: 0.7,
                width: 30,
                height: 30,
            },
        },
        {
            selector: 'edge',
            style: {
                width: 'data(width)',
                lineColor: 'data(color)',
                opacity: 0.5,
            },
        },
    ];

    const layouts = [
        {
            name: 'breadthfirst',
            animate: true,
            animationDuration: 500,
            circle: true,
        },
        {
            name: 'fcose',
            // 'draft', 'default' or 'proof'
            // - "draft" only applies spectral layout
            // - "default" improves the quality with incremental layout (fast cooling rate)
            // - "proof" improves the quality with incremental layout (slow cooling rate)
            quality: 'default',
            // Use random node positions at beginning of layout
            // if this is set to false, then quality option must be "proof"
            randomize: true,
            // Whether or not to animate the layout
            animate: true,
            // Duration of animation in ms, if enabled
            animationDuration: 500,
            // Easing of animation, if enabled
            animationEasing: 'ease-out',
            // Fit the viewport to the repositioned nodes
            fit: true,
            // Padding around layout
            padding: 30,
            // Whether to include labels in node dimensions. Valid in "proof" quality
            nodeDimensionsIncludeLabels: false,
            // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
            uniformNodeDimensions: false,
            // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
            packComponents: true,
            // Layout step - all, transformed, enforced, cose - for debug purpose only
            // step: "all",

            /* spectral layout options */

            // False for random, true for greedy sampling
            samplingType: true,
            // Sample size to construct distance matrix
            sampleSize: 25,
            // Separation amount between nodes
            nodeSeparation: 75,
            // Power iteration tolerance
            piTol: 0.0000001,

            /* incremental layout options */

            // Node repulsion (non overlapping) multiplier
            nodeRepulsion: (node) => 400000,
            // Ideal edge (non nested) length
            idealEdgeLength: (edge) => {
                return Math.max(edge.data().weight * edge.data().numSOTUS * 0.8, 100);
            },
            // Divisor to compute edge forces
            edgeElasticity: (edge) => {
                return edge.data().weight * 0.45;
            },
            // Nesting factor (multiplier) to compute ideal edge length for nested edges
            nestingFactor: 0.1,
            // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
            numIter: 2500,
            // For enabling tiling
            tile: true,
            // The comparison function to be used while sorting nodes during tiling operation.
            // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
            // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
            // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
            // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
            // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
            tilingCompareBy: undefined,
            // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
            tilingPaddingVertical: 10,
            // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
            tilingPaddingHorizontal: 10,
            // Gravity force (constant)
            gravity: 0.25,
            // Gravity range (constant) for compounds
            gravityRangeCompound: 1.5,
            // Gravity force (constant) for compounds
            gravityCompound: 1.0,
            // Gravity range (constant)
            gravityRange: 3.8,
            // Initial cooling factor for incremental layout
            initialEnergyOnIncremental: 0.3,

            /* constraint options */

            // Fix desired nodes to predefined positions
            // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
            fixedNodeConstraint: undefined,
            // Align desired nodes in vertical/horizontal direction
            // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
            alignmentConstraint: undefined,
            // Place two nodes relatively in vertical/horizontal direction
            // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
            relativePlacementConstraint: undefined,
        },
    ];

    const getPlotData = () => {
        if (activeSubgraph === 'All') {
            return plotData;
        }

        const components = headlessCy.elements().components();
        components.sort((a, b) => b.length - a.length);
        if (!components[activeSubgraph - 1]) {
            return [];
        }

        return components[activeSubgraph - 1].jsons();
    };

    const getComponentOptions = () => {
        const numComponents = headlessCy.elements().components().length;
        let componentLabels;
        if (headlessCy.elements().length < 500) {
            componentLabels = Array.from({ length: numComponents }, (_, i) => {
                if (i === 0) {
                    return 'All';
                }
                return i.toString();
            });
        } else {
            componentLabels = Array.from({ length: numComponents - 1 }, (_, i) => {
                return (i + 1).toString();
            });
        }
        return componentLabels;
    };

    return (
        <Box>
            <Box sx={{ position: 'absolute', zIndex: 10 }}>
                <DropDownSelect
                    options={getComponentOptions()}
                    activeOption={activeSubgraph}
                    setActiveOption={(event) => {
                        setActiveSubgraph(event.target.value);
                    }}
                    label='Component'
                />
            </Box>

            <CytoscapeComponent
                cy={setCy}
                stylesheet={stylesheet}
                elements={getPlotData()}
                style={{ width: '60%', height: 600 }}
                layout={layouts[1]}
                minZoom={0.1}
                maxZoom={1}
                userZoomingEnabled={true}
                // wheelSensitivity={0.3}
            />
        </Box>
    );
};

export default NetworkPlot;
