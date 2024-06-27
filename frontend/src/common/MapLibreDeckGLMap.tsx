import React, { useEffect, useRef } from 'react';

// SEND TO constants.ts?
const AMAZON_LOCATION_API_KEY = 'v1.public.eyJqdGkiOiJmZmZkN2UwNC0wNmRmLTQ4OTctOWEzOC00NTA5N2NiODY5MGIifSUgWkDQ2dkshoBIAo_0q3syXuabEaV9KFm9vj6iO5WvXML2A0HDkRXoETBgOzQjQiygufvZfAzJWw4d0FX9rOzRLpTcqr3CoNuolH7JBn3y4SKcRwk4pf-g-LD6tUtYpYgv5UPSx2SjVzTJIgC7hVte0qV7AY6_bptW_8pkfVnbKo_S5LBVxWB2dPDKc_6tiqYllOjOtmugN23b1Qdkhj5Pm5xgBWMQvHhjhNodXIkrYy5RvCE0vvzqd4uD_4bmj45OjXVAu_SO7xyPmV-77gtWSgj5it44McnP40jhBc-GNtMYrGZlyItIrKpbUUslAPCsgVzXVpAN8uF89rec9ko.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx';

const MapLibreDeckGLMap = () => {
    const mapRef = useRef(null);

    const defaultConfig = {};

    const options = {
        ...defaultConfig,
        ...{},
    };

    useEffect(() => {
        if(mapRef.current) {
            const mapRefCurrentUnsafe = mapRef.current as any;

            const div = document.createElement('div');
            div.innerHTML = 'Map goes here ...';

            mapRefCurrentUnsafe.appendChild(div);

            return () => {
                while(mapRefCurrentUnsafe.childNodes.length > 0)
                    mapRefCurrentUnsafe.firstChild.remove();
            };
        }
}, []);

    return <div ref={mapRef}></div>;
};

export default MapLibreDeckGLMap;
