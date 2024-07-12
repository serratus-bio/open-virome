import React, { useEffect, useRef, useState } from 'react';

// SEND TO constants.ts
const AMAZON_LOCATION_API_KEY =
    'v1.public.eyJqdGkiOiJmZmZkN2UwNC0wNmRmLTQ4OTctOWEzOC00NTA5N2NiODY5MGIifSUgWkDQ2dkshoBIAo_0q3syXuabEaV9KFm9vj6iO5WvXML2A0HDkRXoETBgOzQjQiygufvZfAzJWw4d0FX9rOzRLpTcqr3CoNuolH7JBn3y4SKcRwk4pf-g-LD6tUtYpYgv5UPSx2SjVzTJIgC7hVte0qV7AY6_bptW_8pkfVnbKo_S5LBVxWB2dPDKc_6tiqYllOjOtmugN23b1Qdkhj5Pm5xgBWMQvHhjhNodXIkrYy5RvCE0vvzqd4uD_4bmj45OjXVAu_SO7xyPmV-77gtWSgj5it44McnP40jhBc-GNtMYrGZlyItIrKpbUUslAPCsgVzXVpAN8uF89rec9ko.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx';
const LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER = 'Bearer 20240516';
const LOGAN_RDS_PROXY_LAMBDA_ENDPOINT = 'https://omdmrhz5lb2nrbmodjtm5fxhqq0uevzh.lambda-url.us-east-1.on.aws';
const MAPLIBREDECKGLMAP_FETCH_DATA_ON_VIEWPORT_CHANGE = false;

// SEND TO UTIL FUNCTIONS
const bioprojectIDFromBiosample: any = async (biosample) => {
    if (!bioprojectIDFromBiosample._) bioprojectIDFromBiosample._ = {};

    if (!bioprojectIDFromBiosample._[biosample])
        bioprojectIDFromBiosample._[biosample] = (async () => {
            const response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                body: JSON.stringify({ SELECT: "bioproject FROM sra WHERE biosample = '" + biosample + "' LIMIT 1;" }),
                headers: { Authorization: LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                method: 'POST',
            });

            if (response.status === 200) {
                const json = await response.json();

                if (json.length) return json[0].bioproject;
            }
        })();

    return bioprojectIDFromBiosample._[biosample];
};
const selectBiosample: any = async (accession) => {
    if (!selectBiosample._) selectBiosample._ = {};

    if (!selectBiosample._[accession])
        selectBiosample._[accession] = (async () => {
            const response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                body: JSON.stringify({ SELECT: "* FROM biosample WHERE accession = '" + accession + "' LIMIT 1;" }),
                headers: { Authorization: LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                method: 'POST',
            });

            if (response.status === 200) {
                const json = await response.json();

                if (json.length) return json[0];
            }
        })();

    return selectBiosample._[accession];
};
const trimTextEllipsis = (s, n) => (s.length > n ? s.substring(0, n) + '...' : s);

const cyrb128 = (str) => {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;

    for (let i = 0, k; i < str.length; ++i) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }

    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);

    h1 ^= h2 ^ h3 ^ h4;
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;

    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
};

const gaussianRandom = (prng) => {
    const MEAN = 0;
    const STDEV = 1;

    const u = 1 - prng();
    const v = prng();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * STDEV + MEAN;
};

const splitmix32 = (a) => () => {
    a = (a | 0) + (0x9e3779b9 | 0);

    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
};

const DeckGLRenderScatterplot: any = ({
    mbOverlay,
    mlglMap,
    setAttributeName,
    setAttributeValue,
    setBiosampleID,
    setLatLon,
    identifiers,
}) => {
    if (!DeckGLRenderScatterplot.n) DeckGLRenderScatterplot.n = 0;

    ++DeckGLRenderScatterplot.n;

    if (!DeckGLRenderScatterplot.p) DeckGLRenderScatterplot.p = Promise.resolve();

    DeckGLRenderScatterplot.p = DeckGLRenderScatterplot.p.then(async () => {
        if (DeckGLRenderScatterplot.n < 1 + 1) {
            const [ne, sw] = [mlglMap.getBounds().getNorthEast(), mlglMap.getBounds().getSouthWest()];

            const center = mlglMap.getCenter();
            const neswPolygon =
                'POLYGON((' +
                [
                    [ne.lng, ne.lat],
                    [sw.lng, ne.lat],
                    [sw.lng, sw.lat],
                    [ne.lng, sw.lat],
                    [ne.lng, ne.lat],
                ]
                    .map((v) => v.join(' '))
                    .join(',') +
                '))';

            // TODO: Query can be moved to open-virome API after consolodating data in logan DB
            const getIdClauses = (ids = [], idRanges = []) => {
                const clauses = [];
                const idColumn = 'accession';
                if (ids.length > 0) {
                    clauses.push(`${idColumn} IN (${ids.map((id) => `'${id}'`).join(',')})`);
                }
                if (idRanges.length > 0) {
                    idRanges.forEach((range) => {
                        const [start, end] = range;
                        clauses.push(`${idColumn} BETWEEN '${start}' AND '${end}'`);
                    });
                }
                return clauses;
            };

            const identifierClauses = getIdClauses(identifiers?.biosample?.single, identifiers?.biosample?.range);

            const SELECT = `accession, attribute_name, attribute_value, ST_Y(lat_lon) as lat, ST_X(lat_lon) as lon, FLOOR(RANDOM()*2) as class
                FROM biosample_geographical_location
                WHERE
                ${
                    MAPLIBREDECKGLMAP_FETCH_DATA_ON_VIEWPORT_CHANGE
                        ? 'ST_Intersects(lat_lon, ST_SetSRID(ST_GeomFromText(' + neswPolygon + '), 4326))'
                        : 'TRUE'
                }
                ${identifierClauses.length > 0 ? `AND ${identifierClauses.join(' OR ')}` : ''}
                LIMIT 32768;`;
            const responseMs = Date.now();

            let response;
            try {
                // console.debug('[DEBUG]', 'DeckGLRenderScatterplot.SELECT', SELECT);

                response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                    body: JSON.stringify({ SELECT }),
                    headers: { Authorization: LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                    method: 'POST',
                });
            } catch (error) {
                console.error(error);
            }

            if (response && response.status === 200) {
                const json = await response.json();
                const zoomDriftFactor = Math.pow(2, (16 - mlglMap.getZoom()) / 8) / 8000;

                console.debug(
                    '[DEBUG]',
                    'DeckGLRenderScatterplot.json',
                    json.length.toLocaleString() + ' points',
                    (Date.now() - responseMs).toLocaleString() + ' ms',
                );

                mbOverlay.setProps({
                    interleaved: true,
                    layers: [
                        new (globalThis as any).deck.ScatterplotLayer({
                            data: json,
                            getFillColor: (d) => (d.class === 1 ? [0, 128, 255] : [255, 0, 128]),
                            getPosition: (d) => {
                                const prng = splitmix32(cyrb128(d.accession)[0]);

                                return [
                                    d.lon + gaussianRandom(prng) * zoomDriftFactor,
                                    d.lat + gaussianRandom(prng) * zoomDriftFactor,
                                    0,
                                ];
                            },
                            id: 'scatterplotLayer',
                            onHover: (info, event) => {
                                if (info.object) {
                                    setAttributeName(info.object.attribute_name);
                                    setAttributeValue(info.object.attribute_value);

                                    setBiosampleID(info.object.accession);

                                    setLatLon([info.object.lat, info.object.lon].join(','));
                                }
                            },
                            opacity: 0.8,
                            pickable: true,
                            radiusMaxPixels: 16,
                            radiusMinPixels: 4,
                        }),
                    ],
                });
            }
        }

        --DeckGLRenderScatterplot.n;

        if (!DeckGLRenderScatterplot.n) delete DeckGLRenderScatterplot.n;
    });
};

const MapLibreDeckGLMap = ({ style, identifiers }) => {
    style = {
        ...{ height: '100%', position: 'relative', width: '100%' },
        ...style,
    };

    const mapRef = useRef(null);
    const [attributeName, setAttributeName] = useState('');
    const [attributeValue, setAttributeValue] = useState('');
    const [bioprojectID, setBioprojectID] = useState('');
    const [bioprojectName, setBioprojectName] = useState('');
    const [biosampleID, setBiosampleID] = useState('');
    const [biosampleTitle, setBiosampleTitle] = useState('');
    const [latLon, setLatLon] = useState('');

    useEffect(() => {
        if (mapRef.current && globalThis.maplibregl && globalThis.deck) {
            const mapRefCurrentUnsafe = mapRef.current as any;

            const mapDiv = mapRefCurrentUnsafe.appendChild(document.createElement('div'));
            Object.assign(mapDiv.style, {
                height: '100%',
                width: '100%',
                borderRadius: '8px',
            });
            const mlglMap = new (globalThis as any).maplibregl.Map({
                center: [15.529, 43.8234],
                container: mapDiv,
                style:
                    // OpenDataStandardDarkMap, OpenDataVisualizationLightMap, OpenDataVisualizationDarkMap
                    'https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/OpenDataStandardDarkMap/style-descriptor?key=' +
                    AMAZON_LOCATION_API_KEY,
                zoom: 0.8,
            });
            mlglMap.dragRotate.disable();
            mlglMap.getCanvas().style.cursor = 'crosshair';

            const mbOverlay = new (globalThis as any).deck.MapboxOverlay({ interleaved: true });
            mlglMap.addControl(mbOverlay);

            const renderScatterplot = () =>
                DeckGLRenderScatterplot({
                    mbOverlay,
                    mlglMap,
                    setAttributeName,
                    setAttributeValue,
                    setBioprojectID,
                    setBiosampleID,
                    setLatLon,
                    identifiers,
                });

            if (MAPLIBREDECKGLMAP_FETCH_DATA_ON_VIEWPORT_CHANGE) mlglMap.on('moveend', renderScatterplot);
            renderScatterplot();

            return () => {
                mlglMap.remove();

                mapDiv.remove();
            };
        }
    }, []);

    useEffect(() => {
        if (bioprojectID) {
            // ...

            setBioprojectName('<BIOPROJECT_NAME>');
        } else {
            setBioprojectName('');
        }
    }, [bioprojectID]);

    useEffect(() => {
        if (biosampleID) {
            bioprojectIDFromBiosample(biosampleID).then(setBioprojectID);

            selectBiosample(biosampleID).then((data) => setBiosampleTitle(data.title));
        } else {
            setBioprojectID('');
            setBiosampleTitle('');
        }
    }, [biosampleID]);

    return (
        <div style={style}>
            <div
                ref={mapRef}
                style={{ height: 'calc(100% - 64px)', position: 'relative', width: '100%', minHeight: 500 }}
            />

            {/* Tooltip */}
            <div style={{ color: '#FFF', margin: '24px 0 0 0', padding: '0 8px 0 8px' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>ATTRIBUTE NAME</div>
                        <div style={{ fontSize: '18px' }}>{attributeName}</div>
                    </div>
                    <div style={{ flex: '2 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>ATTRIBUTE VALUE</div>
                        <div style={{ fontSize: '18px' }}>{trimTextEllipsis(attributeValue, 40)}</div>
                    </div>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>LAT / LON</div>
                        <div style={{ fontSize: '18px' }}>{latLon}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', margin: '16px 0 0 0' }}>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>BIOSAMPLE</div>
                        <div>
                            {biosampleID ? (
                                <>
                                    <a
                                        href={'https://www.ncbi.nlm.nih.gov/biosample/?term=' + biosampleID}
                                        style={{ color: 'inherit', fontSize: '18px', textDecoration: 'none' }}
                                        target='_blank'
                                    >
                                        {biosampleID}
                                    </a>
                                    <div style={{ fontSize: '14px' }}>{biosampleTitle}</div>
                                </>
                            ) : (
                                '\u200B'
                            )}
                        </div>
                    </div>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>BIOPROJECT</div>
                        <div>
                            {bioprojectID ? (
                                <>
                                    <a
                                        href={'https://www.ncbi.nlm.nih.gov/bioproject/?term=' + bioprojectID}
                                        style={{ color: 'inherit', fontSize: '18px', textDecoration: 'none' }}
                                        target='_blank'
                                    >
                                        {bioprojectID}
                                    </a>
                                    <div style={{ fontSize: '14px' }}>{bioprojectName}</div>
                                </>
                            ) : (
                                '\u200B'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLibreDeckGLMap;
