import MdCopyAll from '@mui/icons-material/CopyAll';
import MdOpenInNew from '@mui/icons-material/OpenInNew';
import React, { useEffect, useRef, useState } from 'react';
import { deflate } from 'pako';

import { isSummaryView } from '../common/utils/plotHelpers.ts';
import { truncate } from '../common/utils/textFormatting.ts';

// SEND TO constants.ts
const AMAZON_LOCATION_API_KEY =
    'v1.public.eyJqdGkiOiJmZmZkN2UwNC0wNmRmLTQ4OTctOWEzOC00NTA5N2NiODY5MGIifSUgWkDQ2dkshoBIAo_0q3syXuabEaV9KFm9vj6iO5WvXML2A0HDkRXoETBgOzQjQiygufvZfAzJWw4d0FX9rOzRLpTcqr3CoNuolH7JBn3y4SKcRwk4pf-g-LD6tUtYpYgv5UPSx2SjVzTJIgC7hVte0qV7AY6_bptW_8pkfVnbKo_S5LBVxWB2dPDKc_6tiqYllOjOtmugN23b1Qdkhj5Pm5xgBWMQvHhjhNodXIkrYy5RvCE0vvzqd4uD_4bmj45OjXVAu_SO7xyPmV-77gtWSgj5it44McnP40jhBc-GNtMYrGZlyItIrKpbUUslAPCsgVzXVpAN8uF89rec9ko.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx';
const LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER = 'Bearer 20240516';
const LOGAN_RDS_PROXY_LAMBDA_ENDPOINT = 'https://omdmrhz5lb2nrbmodjtm5fxhqq0uevzh.lambda-url.us-east-1.on.aws/';
const MAPLIBREDECKGLMAP_FETCH_DATA_ON_VIEWPORT_CHANGE = false;

// SEND TO UTIL FUNCTIONS
const arrayMapColumns = (a, c) => a.map((v) => Object.fromEntries(c.map((_v, _i) => [_v, v[_i]])));
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

                if (json.result?.length) return json.result[0].bioproject;
            }
        })();

    return bioprojectIDFromBiosample._[biosample];
};
const selectBioproject: any = async (accession) => {
    if (!selectBioproject._) selectBioproject._ = {};

    if (!selectBioproject._[accession])
        selectBioproject._[accession] = (async () => {
            const response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                body: JSON.stringify({
                    SELECT: "name, title FROM bioproject WHERE accession = '" + accession + "' LIMIT 1;",
                }),
                headers: { Authorization: LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                method: 'POST',
            });

            if (response.status === 200) {
                const json = await response.json();

                if (json.result?.length) return json.result[0];
            }
        })();

    return selectBioproject._[accession];
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

                if (json.result?.length) return json.result[0];
            }
        })();

    return selectBiosample._[accession];
};

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

const WWF_TEW = Object.fromEntries(Object.entries({
    WWF_TEW_BIOME_01:{ color:'#008346' },
    WWF_TEW_BIOME_02:{ color:'#9DCC00' },
    WWF_TEW_BIOME_03:{ color:'#C4B72E' },
    WWF_TEW_BIOME_04:{ color:'#015C31' },
    WWF_TEW_BIOME_05:{ color:'#006E84' },
    WWF_TEW_BIOME_06:{ color:'#FFA8BB' },
    WWF_TEW_BIOME_07:{ color:'#FAD505' },
    WWF_TEW_BIOME_08:{ color:'#8F7C00' },
    WWF_TEW_BIOME_09:{ color:'#67C7BF' },
    WWF_TEW_BIOME_10:{ color:'#993E01' },
    WWF_TEW_BIOME_11:{ color:'#C20088' },
    WWF_TEW_BIOME_12:{ color:'#0275DC' },
    WWF_TEW_BIOME_13:{ color:'#FFA405' },
    WWF_TEW_BIOME_14:{ color:'#FFCC99' },
    WWF_TEW_BIOME_98:{ color:'#000000' },
    WWF_TEW_BIOME_99:{ color:'#000000' }
})
    .map(([k, v]) => {
        v.color = v.color
            .substring(1)
            .match(/(.{1,2})/g)
            .map(_v => parseInt(_v, 16));

        return [k, v];
    })
);

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

            const SELECT: any = {
                text: `accession, attribute_name, attribute_value, ST_Y(lat_lon) as lat, ST_X(lat_lon) as lon, id
                FROM bgl_gp4326_wwf_tew_pv
                ${identifierClauses.length > 0 ? `WHERE (${identifierClauses.join(' OR ')})` : ''}
                LIMIT 65536;`,
            };
            console.log('SELECT.text', SELECT.text);
            SELECT.deflate = btoa(Array.from(deflate(SELECT.text)).map(v => String.fromCharCode(v)).join(''));
            const responseMs = Date.now();

            let response;
            try {
                console.debug('[DEBUG]', 'DeckGLRenderScatterplot.SELECT', SELECT);

                response = await fetch(LOGAN_RDS_PROXY_LAMBDA_ENDPOINT, {
                    body: JSON.stringify({ SELECT: SELECT.deflate, array: true, deflate: true }),
                    headers: { Authorization: LOGAN_RDS_PROXY_LAMBDA_AUTHORIZATION_HEADER },
                    method: 'POST',
                });
            } catch (error) {
                console.error(error);
            }

            if (response && response.status === 200) {
                let json = await response.json();

                json = arrayMapColumns(json.result, [
                    'accession',
                    'attribute_name',
                    'attribute_value',
                    'lat',
                    'lon',
                    'id'
                ]);
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
                            getFillColor:d => {
                                if(!d.id)
                                    d.id = 'WWF_TEW_BIOME_99';

                                return WWF_TEW[d.id].color;
                            },
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

const MapLibreDeckGLMap = ({ identifiers, style = {} }) => {
    style = {
        ...{ height: '100%', position: 'relative', width: '100%' },
        ...style,
    };

    const mapRef = useRef(null);
    const [attributeName, setAttributeName] = useState('');
    const [attributeValue, setAttributeValue] = useState('');
    const [bioprojectID, setBioprojectID] = useState('');
    const [bioprojectName, setBioprojectName] = useState('');
    const [bioprojectTitle, setBioprojectTitle] = useState('');
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
                    // OpenDataStandardDarkMap, OpenDataVisualizationLightMap, OpenDataVisualizationDarkMap, ESRIDarkGreyMap
                    'https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/OpenDataVisualizationLightMap/style-descriptor?key=' +
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
    }, [identifiers]);

    useEffect(() => {
        if (bioprojectID)
            selectBioproject(bioprojectID).then((data) => {
                if (data) {
                    setBioprojectName(data.name || '');
                    setBioprojectTitle(data.title || '');
                }
            });
        else {
            setBioprojectName('');
            setBioprojectTitle('');
        }
    }, [bioprojectID]);

    useEffect(() => {
        if (biosampleID) {
            bioprojectIDFromBiosample(biosampleID).then(setBioprojectID);

            selectBiosample(biosampleID).then((data) => {
                if (data) setBiosampleTitle(data.title || '');
            });
        } else {
            setBioprojectID('');
            setBiosampleTitle('');
        }
    }, [biosampleID]);

    return (
        <div style={style}>
            <div ref={mapRef} style={{ height: '70vh', position: 'relative', width: '100%' }} />
            {/* Tooltip */}
            <div style={{ color: '#FFF', margin: '24px 0 0 0', padding: '0 8px 0 0px', height: 200 }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                            <span>ATTRIBUTE NAME</span>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(attributeName)} />
                        </div>
                        <div style={{ fontSize: '18px', margin: '2px 0 0 0' }}>{attributeName}</div>
                    </div>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                            <span>ATTRIBUTE VALUE</span>
                            <MapLibreDeckGLMapCopyButton
                                onClick={() => navigator.clipboard.writeText(attributeValue)}
                            />
                        </div>
                        <div style={{ fontSize: '18px', margin: '2px 0 0 0' }}>{truncate(attributeValue, 40)}</div>
                    </div>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                            <span>LAT / LON</span>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(latLon)} />
                            <MapLibreDeckGLMapURLButton
                                href={'https://www.google.com/maps/search/?api=1&query=' + latLon}
                            />
                        </div>
                        <div style={{ fontSize: '18px', margin: '2px 0 0 0' }}>{latLon}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', margin: '16px 0 0 0' }}>
                    <div style={{ flex: '1 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                            <span>BIOSAMPLE</span>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(biosampleID)} />
                            <MapLibreDeckGLMapURLButton
                                href={'https://www.ncbi.nlm.nih.gov/biosample/?term=' + biosampleID}
                            />
                        </div>
                        <div style={{ margin: '2px 0 0 0' }}>
                            {biosampleID ? (
                                <>
                                    <div style={{ fontSize: '18px' }}>{biosampleID}</div>
                                    <div style={{ fontSize: '14px' }}>{biosampleTitle}</div>
                                </>
                            ) : (
                                '\u200B'
                            )}
                        </div>
                    </div>
                    <div style={{ flex: '2 0' }}>
                        <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                            <span>BIOPROJECT</span>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(bioprojectID)} />
                            <MapLibreDeckGLMapURLButton
                                href={'https://www.ncbi.nlm.nih.gov/bioproject/?term=' + bioprojectID}
                            />
                        </div>
                        <div style={{ margin: '2px 0 0 0' }}>
                            {bioprojectID ? (
                                <>
                                    <div style={{ fontSize: '18px' }}>{bioprojectID}</div>
                                    <div style={{ fontSize: '14px' }}>{bioprojectName}</div>
                                    <div style={{ fontSize: '14px' }}>{bioprojectTitle}</div>
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

const MapLibreDeckGLMapCopyButton = (props) => (
    <MdCopyAll
        style={{
            color: '#FFF',
            cursor: 'pointer',
            fontSize: '18px',
            margin: '4px 0 0 6px',
            userSelect: 'none',
            verticalAlign: 'bottom',
        }}
        {...props}
    />
);
const MapLibreDeckGLMapURLButton = (props) => (
    <a style={{ color: '#FFF', margin: '4px 0 0 6px', userSelect: 'none' }} target='_blank' {...props}>
        <MdOpenInNew style={{ fontSize: '18px', verticalAlign: 'bottom' }} />
    </a>
);

export default MapLibreDeckGLMap;
