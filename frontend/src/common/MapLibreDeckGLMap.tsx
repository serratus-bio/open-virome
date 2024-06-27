import React from 'react';
import { Map, useControl } from 'react-map-gl/maplibre';

import { MapboxOverlay } from '@deck.gl/mapbox';
import { DeckProps } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

// SEND TO constants.ts?
const AMAZON_LOCATION_API_KEY = 'v1.public.eyJqdGkiOiJmZmZkN2UwNC0wNmRmLTQ4OTctOWEzOC00NTA5N2NiODY5MGIifSUgWkDQ2dkshoBIAo_0q3syXuabEaV9KFm9vj6iO5WvXML2A0HDkRXoETBgOzQjQiygufvZfAzJWw4d0FX9rOzRLpTcqr3CoNuolH7JBn3y4SKcRwk4pf-g-LD6tUtYpYgv5UPSx2SjVzTJIgC7hVte0qV7AY6_bptW_8pkfVnbKo_S5LBVxWB2dPDKc_6tiqYllOjOtmugN23b1Qdkhj5Pm5xgBWMQvHhjhNodXIkrYy5RvCE0vvzqd4uD_4bmj45OjXVAu_SO7xyPmV-77gtWSgj5it44McnP40jhBc-GNtMYrGZlyItIrKpbUUslAPCsgVzXVpAN8uF89rec9ko.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx';

function DeckGLOverlay(props: DeckProps) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));

    overlay.setProps(props);

    console.log('props', props);
    
    return null;
};

const MapLibreDeckGLMap = () => {
    const defaultConfig = {};

    const options = {
        ...defaultConfig,
        ...{},
    };

    // return <Map
    //     initialViewState={{
    //         latitude:43.6586,
    //         longitude:-79.3915,
    //         zoom:12
    //     }}
    //     mapStyle={'https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/OpenDataVisualizationLightMap/style-descriptor?key=' + AMAZON_LOCATION_API_KEY}
    //     style={{ height:'100%', width:'100%' }}
    // />;

    return <Map
        initialViewState={{
            // latitude:43.6586,
            // longitude:-79.3915,
            latitude:0.45,
            longitude:51.47,
            zoom:12
        }}
        mapStyle={'https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/OpenDataVisualizationLightMap/style-descriptor?key=' + AMAZON_LOCATION_API_KEY}
    >
        <DeckGLOverlay layers={[
            new ScatterplotLayer({
                beforeId:'waterway-label',
                data:[{ position:[0.45, 51.47] }],
                getFillColor:[255, 0, 0, 100],
                getPosition:d => {
                    console.log('d.position', d.position);

                    return d.position;
                },
                getRadius:1000,
                id:'deckgl-circle'
            })
        ]} />
    </Map>;
};

export default MapLibreDeckGLMap;
