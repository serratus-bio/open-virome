import React, { useEffect, useRef, useState } from 'react';

// SEND TO constants.ts
const AMAZON_LOCATION_API_KEY = 'v1.public.eyJqdGkiOiJmZmZkN2UwNC0wNmRmLTQ4OTctOWEzOC00NTA5N2NiODY5MGIifSUgWkDQ2dkshoBIAo_0q3syXuabEaV9KFm9vj6iO5WvXML2A0HDkRXoETBgOzQjQiygufvZfAzJWw4d0FX9rOzRLpTcqr3CoNuolH7JBn3y4SKcRwk4pf-g-LD6tUtYpYgv5UPSx2SjVzTJIgC7hVte0qV7AY6_bptW_8pkfVnbKo_S5LBVxWB2dPDKc_6tiqYllOjOtmugN23b1Qdkhj5Pm5xgBWMQvHhjhNodXIkrYy5RvCE0vvzqd4uD_4bmj45OjXVAu_SO7xyPmV-77gtWSgj5it44McnP40jhBc-GNtMYrGZlyItIrKpbUUslAPCsgVzXVpAN8uF89rec9ko.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx';
const LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER = 'Bearer 20240516';
const LOGAN_RDS_PROXY_LAMBDA_ENDPOINT = 'https://omdmrhz5lb2nrbmodjtm5fxhqq0uevzh.lambda-url.us-east-1.on.aws';
// /

// SEND TO UTIL FUNCTIONS FOR QUERYING DATA
const bioprojectIDFromBiosampleID:any = async biosampleID => {
    if(!bioprojectIDFromBiosampleID._)
        bioprojectIDFromBiosampleID._ = {};

    if(!bioprojectIDFromBiosampleID._[biosampleID])
        bioprojectIDFromBiosampleID._[biosampleID] = (async () => {
            const response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                body:JSON.stringify({ SELECT:'bioproject FROM sra WHERE biosample = \'' + biosampleID + '\' LIMIT 1;' }),
                headers:{ Authorization:LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                method:'POST'
            });

            if(response.status === 200) {
                const json = await response.json();

                if(json.length)
                    return json[0].bioproject;
            }
        })();

    return bioprojectIDFromBiosampleID._[biosampleID];
};
// /

const cyrb128 = str => {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;

    for(let i=0,k;i<str.length;++i) {
        k = str.charCodeAt(i);
        h1 = h2^Math.imul(h1^k, 597399067);
        h2 = h3^Math.imul(h2^k, 2869860233);
        h3 = h4^Math.imul(h3^k, 951274213);
        h4 = h1^Math.imul(h4^k, 2716044179);
    }

    h1 = Math.imul(h3^(h1>>>18), 597399067);
    h2 = Math.imul(h4^(h2>>>22), 2869860233);
    h3 = Math.imul(h1^(h3>>>17), 951274213);
    h4 = Math.imul(h2^(h4>>>19), 2716044179);

    h1 ^= (h2^h3^h4);
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;

    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
};

const gaussianRandom = prng => {
    const MEAN = 0;
    const STDEV = 1;

    const u = 1-prng();
    const v = prng();
    const z = Math.sqrt(-2.0*Math.log(u))*Math.cos(2.0*Math.PI*v);
    return z*STDEV+MEAN;
};

const splitmix32 = a => () => {
    a = (a|0)+(0x9E3779B9|0);

    let t = a^a>>>16;
    t = Math.imul(t, 0x21F0AAAD);
    t = t^t>>>15;
    t = Math.imul(t, 0x735A2D97);
    return ((t = t^t>>>15)>>>0)/4294967296;
};

const DeckGLRenderScatterplot:any = ({ mbOverlay, mlglMap, setBioprojectID, setBiosampleID }) => {
    if(!DeckGLRenderScatterplot.n)
        DeckGLRenderScatterplot.n = 0;

    ++DeckGLRenderScatterplot.n;

    if(!DeckGLRenderScatterplot.p)
        DeckGLRenderScatterplot.p = Promise.resolve();

    DeckGLRenderScatterplot.p = DeckGLRenderScatterplot.p.then(async () => {

        if(DeckGLRenderScatterplot.n < (1+1)) {
            const [ne, sw] = [mlglMap.getBounds().getNorthEast(), mlglMap.getBounds().getSouthWest()];
            const neswPolygon = 'POLYGON((' + [
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat]
            ].map(v => v.join(' ')).join(',') + '))';

            const response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                body:JSON.stringify({ SELECT:'accession, ST_Y(lat_lon) as lat, ST_X(lat_lon) as lon, FLOOR(RANDOM()*2) as class FROM biosample_geographical_location WHERE ST_Intersects(lat_lon, ST_SetSRID(ST_GeomFromText(\'' + neswPolygon + '\'), 4326)) LIMIT 8192;' }),
                headers:{ Authorization:LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                method:'POST'
            });

            if(response.status === 200) {
                const zoomDriftFactor = Math.pow(2, (16-mlglMap.getZoom())/8)/8000;

                mbOverlay.setProps({ interleaved:true, layers:[new (globalThis as any).deck.ScatterplotLayer({
                    data:await response.json(),
                    getFillColor:d => (d.class === 1 ? [0, 128, 255] : [255, 0, 128]),
                    getPosition:d => {
                        const prng = splitmix32(cyrb128(d.accession)[0]);

                        return [
                            d.lon + gaussianRandom(prng)*zoomDriftFactor,
                            d.lat + gaussianRandom(prng)*zoomDriftFactor,
                            0
                        ];
                    },
                    id:'scatterplotLayer',
                    onHover:(info, event) => {
                        if(info.object) {
                            setBiosampleID(info.object.accession);
                            setBioprojectID('');

                            bioprojectIDFromBiosampleID(info.object.accession)
                                .then(setBioprojectID);
                        }
                    },
                    opacity:0.2,
                    pickable:true,
                    radiusMaxPixels:16,
                    radiusMinPixels:4
                })] });
            }
        }

        --DeckGLRenderScatterplot.n;

        if(!DeckGLRenderScatterplot.n)
        delete DeckGLRenderScatterplot.n;
    });
};

const MapLibreDeckGLMapTooltip = ({ biosampleID, bioprojectID }) =>
    <div style={{ backgroundColor:'rgba(0,0,0,0.6)', borderRadius:'4px', color:'#FFF', fontFamily:'sans-serif', fontSize:'16px', fontWeight:'16px', lineHeight:'20px', padding:'8px 8px 8px 8px', position:'absolute', right:'8px', top:'8px', zIndex:2 }}>
        <div style={{ fontSize:'14px', fontWeight:700 }}>BIOSAMPLE</div>
        <div>{ biosampleID ? <a href={ 'https://www.ncbi.nlm.nih.gov/biosample/?term=' + biosampleID } style={{ color:'inherit', textDecoration:'none'}} target="_blank">{biosampleID}</a> : '\u200B' }</div>
        <br />
        <div style={{ fontSize:'14px', fontWeight:700 }}>BIOPROJECT</div>
        <div>{ bioprojectID ? <a href={ 'https://www.ncbi.nlm.nih.gov/bioproject/?term=' + bioprojectID } style={{ color:'inherit', textDecoration:'none'}} target="_blank">{bioprojectID}</a> : '\u200B' }</div>
    </div>;

const MapLibreDeckGLMap = ({ style }) => {
    style = {
        ...{ position:'relative' },
        ...style
    };

    const mapRef = useRef(null);
    const [bioprojectID, setBioprojectID] = useState('');
    const [biosampleID, setBiosampleID] = useState('');

    useEffect(() => {
        if(mapRef.current) {
            const mapRefCurrentUnsafe = mapRef.current as any;

            const mapDiv = mapRefCurrentUnsafe.appendChild(document.createElement('div'));
            Object.assign(mapDiv.style, { height:'100%', left:0, position:'absolute', top:0, width:'100%' });
            
            const mlglMap = new (globalThis as any).maplibregl.Map({
                center:[-79.3915, 43.6586],
                container:mapDiv,
                style:'https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/OpenDataVisualizationLightMap/style-descriptor?key=' + AMAZON_LOCATION_API_KEY,
                zoom:12
            });
            mlglMap.dragRotate.disable();
            mlglMap.getCanvas().style.cursor = 'crosshair';

            const mbOverlay = new (globalThis as any).deck.MapboxOverlay({ interleaved:true });
            mlglMap.addControl(mbOverlay);

            const renderScatterplot = () => DeckGLRenderScatterplot({ mbOverlay, mlglMap, setBioprojectID, setBiosampleID });
            
            mlglMap.on('moveend', renderScatterplot);
            renderScatterplot();

            return () => {
                mlglMap.remove();

                mapDiv.remove();
            };
        }
    }, []);

    return <div ref={mapRef} style={ style }>
        <MapLibreDeckGLMapTooltip biosampleID={biosampleID} bioprojectID={bioprojectID} />
    </div>;
};

export default MapLibreDeckGLMap;
