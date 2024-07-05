import React, { useState, useEffect } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cise from 'cytoscape-cise';
import CytoscapeComponent from 'react-cytoscapejs';

cytoscape.use(fcose);
cytoscape.use(cise);

const NetworkPlot = ({ plotData = [] }) => {
    const [cy, setCy] = useState(null);
    const [activeSubgraph, setActiveSubgraph] = useState(0);

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
                // label: 'data(label)',
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

    useEffect(() => {
        if (cy) {
            cy.elements().markovClustering({ expandFactor: 10 });
        }
    }, [cy]);

    const getCluserInfo = (node) => {
        if (!cy || !node.data('clusterID')) {
            return '';
        }
        return node.data('clusterID');
    };

    useEffect(() => {
        if (!cy) {
            return;
        }
        console.log('^^^^', cy.elements());
        // const other_elements = cy.elements().not(`[clusterID = ${activeSubgraph}]`)

        // cy.remove(other_elements)

        // const subgraph =  plotData.filter(
        //     (data) => (data.isNode && data.data('clusterID') === activeSubgraph) || data.isEdge
        // );
        // return subgraph;
    }, []);

    const layouts = [
        {
            name: 'cose',
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
            animationDuration: 1000,
            // Easing of animation, if enabled
            animationEasing: undefined,
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
            nodeRepulsion: (node) => 450000,
            // Ideal edge (non nested) length
            idealEdgeLength: (edge) => {
                return edge.data().weight * 300;
            },
            // Divisor to compute edge forces
            edgeElasticity: (edge) => {
                return edge.data().weight * 0.15;
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
        {
            name: 'cise',
            clusters: getCluserInfo,
            // -------- Optional parameters --------

            // Use random node positions at beginning of layout
            // if this is set to false, the layout will be incremental
            randomize: true,

            // Whether to animate the layout
            // - true : Animate while the layout is running
            // - false : Just show the end result
            // - 'end' : Animate directly to the end result
            animate: 'end',

            // number of ticks per frame; higher is faster but more jerky
            refresh: 10,

            // Animation duration used for animate:'end'
            animationDuration: undefined,

            // Easing for animate:'end'
            animationEasing: undefined,

            // Whether to fit the viewport to the repositioned graph
            // true : Fits at end of layout for animate:false or animate:'end'
            fit: true,

            // Padding in rendered co-ordinates around the layout
            padding: 30,

            // Whether to include labels in node dimensions
            nodeDimensionsIncludeLabels: false,

            // separation amount between nodes in a cluster
            // note: increasing this amount will also increase the simulation time
            nodeSeparation: 12.5,

            // Inter-cluster edge length factor
            // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
            idealInterClusterEdgeLengthCoefficient: 3,

            // Whether to pull on-circle nodes inside of the circle
            allowNodesInsideCircle: true,

            // Max percentage of the nodes in a circle that can move inside the circle
            maxRatioOfNodesInsideCircle: 0.1,

            // - Lower values give looser springs
            // - Higher values give tighter springs
            springCoeff: (edge) => edge.data().weight,

            // Node repulsion (non overlapping) multiplier
            nodeRepulsion: (node) => 4500,

            // Gravity force (constant)
            gravity: 0.25,

            // Gravity range (constant)
            gravityRange: 3.8,

            // whether to pack components of the graph, if set to true, you should import cytoscape.js-layout-utilities
            packComponents: false,
        },
        {
            name: 'breadthfirst',
            circle: true,
            spacingFactor: 4,
        },
    ];

    return (
        <CytoscapeComponent
            cy={setCy}
            stylesheet={stylesheet}
            elements={plotData}
            style={{ width: '100%', height: '100%', minHeight: '70vh' }}
            layout={layouts[1]}
        />
    );
};

export default NetworkPlot;
