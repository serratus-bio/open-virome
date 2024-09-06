import MdCopyAll from '@mui/icons-material/CopyAll';
import MdOpenInNew from '@mui/icons-material/OpenInNew';
import React, { useEffect, useRef, useState } from 'react';
import Flag from 'react-world-flags';
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

const regionCountries = {
    'Africa':['AGO', 'BDI', 'BEN', 'BFA', 'BWA', 'CAF', 'CIV', 'CMR', 'COD', 'COG', 'COM', 'CPV', 'DJI', 'DZA', 'EGY', 'ERI', 'ESH', 'ETH', 'GAB', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'KEN', 'LBR', 'LBY', 'LSO', 'MAR', 'MDG', 'MLI', 'MOZ', 'MRT', 'MUS', 'MWI', 'MYT', 'NAM', 'NER', 'NGA', 'REU', 'RWA', 'SDN', 'SEN', 'SLE', 'SOM', 'SSD', 'STP', 'SWZ', 'SYC', 'TCD', 'TGO', 'TUN', 'TZA', 'UGA', 'ZAF', 'ZMB', 'ZWE'],
    'Antarctica':['ATF', 'BVT', 'HMD'],
    'Asia':['AFG', 'ARE', 'ARM', 'AZE', 'BGD', 'BHR', 'BRN', 'BTN', 'CHN', 'CYP', 'GEO', 'HKG', 'IDN', 'IND', 'IOT', 'IRN', 'IRQ', 'ISR', 'JOR', 'JPN', 'KAZ', 'KGZ', 'KHM', 'KOR', 'KWT', 'LAO', 'LBN', 'LKA', 'MAC', 'MMR', 'MNG', 'MYS', 'NPL', 'OMN', 'PAK', 'PHL', 'PRK', 'PSE', 'QAT', 'RUS', 'SAU', 'SGP', 'SYR', 'THA', 'TJK', 'TKM', 'TLS', 'TUR', 'TWN', 'UZB', 'VNM', 'YEM'],
    'Europe':['ALB', 'AND', 'AUT', 'BEL', 'BGR', 'BIH', 'BLR', 'CHE', 'CZE', 'DEU', 'DNK', 'ESP', 'EST', 'FIN', 'FRA', 'FRO', 'GBR', 'GIB', 'GRC', 'HRV', 'HUN', 'IRL', 'ISL', 'ITA', 'LIE', 'LTU', 'LUX', 'LVA', 'MCO', 'MDA', 'MKD', 'MLT', 'MNE', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'SJM', 'SMR', 'SRB', 'SVK', 'SVN', 'SWE', 'UKR', 'VAT'],
    'North America':['ANT', 'ABW', 'AIA', 'ATG', 'BHS', 'BLZ', 'BMU', 'BRB', 'CAN', 'CRI', 'CUB', 'CYM', 'DMA', 'DOM', 'GLP', 'GRD', 'GRL', 'GTM', 'HND', 'HTI', 'JAM', 'KNA', 'LCA', 'MEX', 'MSR', 'MTQ', 'NIC', 'PAN', 'PRI', 'SLV', 'TCA', 'TTO', 'USA', 'VCT', 'VGB', 'VIR'],
    'Oceania':['ASM', 'AUS', 'CCK', 'COK', 'CXR', 'FJI', 'FLK', 'FSM', 'GUM', 'KIR', 'MNP', 'NCL', 'NFK', 'NIU', 'NRU', 'NZL', 'PCN', 'PLW', 'PNG', 'PYF', 'SLB', 'TON', 'VUT', 'WSM'],
    'South America':['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUF', 'GUY', 'PER', 'PRY', 'SUR', 'URY', 'VEN'],
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
    WWF_TEW_BIOME_01:{ hex:'#008346', name:'Tropical & Subtropical Moist Broadleaf Forests' },
    WWF_TEW_BIOME_02:{ hex:'#9DCC00', name:'Tropical & Subtropical Dry Broadleaf Forests' },
    WWF_TEW_BIOME_03:{ hex:'#C4B72E', name:'Tropical & Subtropical Coniferous Forests' },
    WWF_TEW_BIOME_04:{ hex:'#015C31', name:'Temperate Broadleaf & Mixed Forests' },
    WWF_TEW_BIOME_05:{ hex:'#006E84', name:'Temperate Conifer Forests' },
    WWF_TEW_BIOME_06:{ hex:'#FFA8BB', name:'Boreal Forests/Taiga' },
    WWF_TEW_BIOME_07:{ hex:'#FAD505', name:'Tropical & Subtropical Grasslands, Savannas & Shrublands' },
    WWF_TEW_BIOME_08:{ hex:'#8F7C00', name:'Temperate Grasslands, Savannas & Shrublands' },
    WWF_TEW_BIOME_09:{ hex:'#67C7BF', name:'Flooded Grasslands & Savannas' },
    WWF_TEW_BIOME_10:{ hex:'#993E01', name:'Montane Grasslands & Shrublands' },
    WWF_TEW_BIOME_11:{ hex:'#C20088', name:'Tundra' },
    WWF_TEW_BIOME_12:{ hex:'#0275DC', name:'Mediterranean Forests, Woodlands & Scrub' },
    WWF_TEW_BIOME_13:{ hex:'#FFA405', name:'Deserts & Xeric Shrublands' },
    WWF_TEW_BIOME_14:{ hex:'#FFCC99', name:'Mangroves' },
    WWF_TEW_BIOME_98:{ hex:'#000000', name:'Ocean' },
    WWF_TEW_BIOME_99:{ hex:'#000000', name:'Ocean' }
})
    .map(([k, v]) => {
        v.rgb = v.hex
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
    setBiomeID,
    setBiosampleID,
    setCountryID,
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
                text: `accession, attribute_name, attribute_value, ST_Y(lat_lon) as lat, ST_X(lat_lon) as lon, gm4326_id, gp4326_wwf_tew_id
                FROM bgl_gm4326_gp4326
                WHERE palm_virome = TRUE
                ${identifierClauses.length > 0 ? ` AND (${identifierClauses.join(' OR ')})` : ''}
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
                    'gm4326_id',
                    'gp4326_wwf_tew_id'
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
                                if(!d.gp4326_wwf_tew_id)
                                    d.gp4326_wwf_tew_id = 'WWF_TEW_BIOME_99';

                                return WWF_TEW[d.gp4326_wwf_tew_id].rgb;
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
                            onClick: (info, event) => {
                                if (info.object) {
                                    setAttributeName(info.object.attribute_name);
                                    setAttributeValue(info.object.attribute_value);

                                    setBiomeID(info.object.gp4326_wwf_tew_id);
                                    setBiosampleID(info.object.accession);

                                    setCountryID(info.object.gm4326_id);

                                    setLatLon([info.object.lat, info.object.lon].join(','));
                                }
                            },
                            opacity: 0.8,
                            pickable: true,
                            radiusMaxPixels: 16,
                            radiusMinPixels: 6,
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
    const [biomeID, setBiomeID] = useState('');
    const [bioprojectID, setBioprojectID] = useState('');
    const [bioprojectName, setBioprojectName] = useState('');
    const [bioprojectTitle, setBioprojectTitle] = useState('');
    const [biosampleID, setBiosampleID] = useState('');
    const [biosampleTitle, setBiosampleTitle] = useState('');
    const [countryID, setCountryID] = useState('');
    const [countryRegionID, setCountryRegionID] = useState('');
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
                    setBiomeID,
                    setBioprojectID,
                    setBiosampleID,
                    setCountryID,
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

    useEffect(() => {
        if(countryID)
            setCountryRegionID(Object.keys(regionCountries).filter(k => regionCountries[k].includes(countryID))[0]);
        else if(
               biomeID === 'WWF_TEW_BIOME_98'
            || biomeID === 'WWF_TEW_BIOME_99'
        )
            setCountryRegionID('Ocean');
        else
            setCountryRegionID('');
    }, [biomeID, countryID]);

    return (
        <div style={style}>
            <div ref={mapRef} style={{ height: '70vh', position: 'relative', width: '100%' }}>
                {/* Tooltip */}
                <div style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', borderRadius: '6px', color: '#FFF', maxHeight: '512px', overflowY: 'scroll', padding: '12px 16px 16px 16px', position: 'absolute', right: '8px', top: '8px', width: '384px', zIndex: 1 }}>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>ATTRIBUTE NAME</span>
                        <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(attributeName)} />
                    </div>
                    <div style={{ fontSize: '18px', margin: '2px 0 0 0' }}>{attributeName}</div>
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>ATTRIBUTE VALUE</span>
                        <MapLibreDeckGLMapCopyButton
                            onClick={() => navigator.clipboard.writeText(attributeValue)}
                        />
                    </div>
                    <div style={{ fontSize: '18px', margin: '2px 0 0 0' }}>{truncate(attributeValue, 40)}</div>
                    <div style={{ height: '8px' }}></div>
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
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>BIOSAMPLE</span>
                        <div style={{ color: '#FFF', display: 'inline', fontSize: '18px', fontWeight: 400, margin: '0 0 0 8px' }}>{biosampleID}</div>
                        <div style={{ display: 'inline', margin: '0 0 0 4px', verticalAlign: 'top' }}>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(biosampleID)} />
                            <MapLibreDeckGLMapURLButton
                                href={'https://www.ncbi.nlm.nih.gov/biosample/?term=' + biosampleID}
                            />
                        </div>
                    </div>
                    <div style={{ margin: '2px 0 0 0' }}>
                        {biosampleID ? (
                            <div style={{ fontSize: '14px' }}>{biosampleTitle}</div>
                        ) : (
                            '\u200B'
                        )}
                    </div>
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>BIOPROJECT</span>
                        <div style={{ color: '#FFF', display: 'inline', fontSize: '18px', fontWeight: 400, margin: '0 0 0 8px' }}>{bioprojectID}</div>
                        <div style={{ display: 'inline', margin: '0 0 0 4px', verticalAlign: 'top' }}>
                            <MapLibreDeckGLMapCopyButton onClick={() => navigator.clipboard.writeText(bioprojectID)} />
                            <MapLibreDeckGLMapURLButton
                                href={'https://www.ncbi.nlm.nih.gov/bioproject/?term=' + bioprojectID}
                            />
                        </div>
                    </div>
                    <div style={{ margin: '2px 0 0 0' }}>
                        {bioprojectID ? (
                            <>
                                <div style={{ fontSize: '14px' }}>{bioprojectName}</div>
                                <div style={{ fontSize: '14px' }}>{bioprojectTitle}</div>
                            </>
                        ) : (
                            '\u200B'
                        )}
                    </div>
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span style={{ verticalAlign:'middle' }}>BIOME</span>
                        <span style={{ backgroundColor:biomeID ? WWF_TEW[biomeID].hex : 'transparent', display:'inline-block', height:'14px', fontSize: '14px', margin:'0 0 0 8px', verticalAlign:'middle', width:'36px' }} />
                    </div>
                    <div style={{ margin: '2px 0 0 0' }}>
                        <span style={{ fontSize: '14px', verticalAlign:'middle' }}>{biomeID && WWF_TEW[biomeID].name}</span>
                    </div>
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>COUNTRY</span>
                    </div>
                    <div style={{ margin: '2px 0 0 0' }}>
                        <Flag code={countryID} height="16" style={{ verticalAlign:'middle' }} />
                        <span style={{ fontSize: '14px', margin:'0 0 0 8px', verticalAlign:'middle' }}>{countryID}</span>
                    </div>
                    <div style={{ height: '8px' }}></div>
                    <div style={{ color: '#CCC', fontSize: '12px', fontWeight: 700 }}>
                        <span>REGION</span>
                    </div>
                    <div style={{ margin: '2px 0 0 0' }}>
                        <span style={{ fontSize: '14px' }}>{countryRegionID}</span>
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
