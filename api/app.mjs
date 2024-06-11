import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as db from './db/index.mjs';
import 'dotenv/config';
import { getFilterClauses, getIdClauses, reduceConsecutiveToRange } from './utils.mjs';

const app = express();
const port = 8000;

app.use(cors());

app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

app.use((req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer 20240516') {
        // return res.status(403).json({ error: 'No credentials sent!' });
    }
    next();
});

const runQuery = async (query) => {
    try {
        const result = await db.query(query);
        return result.rows;
    } catch (e) {
        return { error: JSON.stringify(e) };
    }
};

app.post('/filters', async (req, res) => {
    const body = req.body;

    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const filters = body?.filters || [];
    const groupBy = body?.groupBy || undefined;
    const queryString = body?.queryString || undefined;
    const sortByColumn = body?.sortByColumn || 'count';
    const sortByDirection = body?.sortByDirection || 'desc';
    const pageStart = body?.pageStart || undefined;
    const pageEnd = body?.pageEnd || undefined;
    if (groupBy === undefined) {
        return res.status(400).json({ error: 'groupBy is required!' });
    }

    const clauses = getFilterClauses(filters, groupBy, queryString);

    const query = `
        SELECT ${groupBy} as name, COUNT(DISTINCT run_id) as count
        FROM open_virome
        ${clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''}
        GROUP BY ${groupBy}
        ORDER BY ${sortByColumn} ${sortByDirection}
        ${pageEnd !== undefined ? `LIMIT ${pageEnd} OFFSET ${pageStart}` : ''}
    `;

    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.json(result);
});

app.post('/ids', async (req, res) => {
    const body = req.body;

    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const filters = body?.filters || [];
    const queryString = body?.queryString || undefined;
    const sortByDirection = body?.sortByDirection || 'desc';

    const clauses = getFilterClauses(filters, 'run_id', queryString);

    const query = `
        SELECT distinct run_id, bioproject, biosample
        FROM open_virome
        ${clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''}
        ORDER BY run_id ${sortByDirection}
    `;

    const result = await runQuery(query);

    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }

    let runIds = result.map((row) => row.run_id).filter((biosample) => biosample !== null);
    runIds = [...new Set(runIds)];
    const [runIdRanges, runIdSingles] = reduceConsecutiveToRange(runIds);

    let biprojects = result.map((row) => row.bioproject).filter((biosample) => biosample !== null);
    biprojects = [...new Set(biprojects)];
    const [bioprojectRanges, bioprojectSingles] = reduceConsecutiveToRange(biprojects);

    let biosamples = result.map((row) => row.biosample).filter((biosample) => biosample !== null);
    biosamples = [...new Set(biosamples)];
    const [biosampleRanges, biosampleSingles] = reduceConsecutiveToRange(biosamples);

    return res.json({
        run: {
            single: runIdSingles,
            range: runIdRanges,
            totalCount: runIds.length,
        },
        bioproject: {
            single: bioprojectSingles,
            range: bioprojectRanges,
            totalCount: biprojects.length,
        },
        biosample: {
            single: biosampleSingles,
            range: biosampleRanges,
            totalCount: biosamples.length,
        },
    });
});

app.post('/results', async (req, res) => {
    const body = req.body;
    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const idColumn = body?.idColumn || 'run_id';
    const ids = body?.ids || [];
    const idRanges = body?.idRanges || [];
    const table = body?.table || 'rfamily2';
    const columns = body?.columns || '*';
    const sortByColumn = body?.sortByColumn || idColumn;
    const sortByDirection = body?.sortByDirection || 'desc';
    const pageStart = body?.pageStart || 0;
    const pageEnd = body?.pageEnd || 10;

    const clauses = getIdClauses(ids, idRanges, idColumn);

    const query = `
        SELECT ${columns}
        FROM ${table}
        ${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}
        ORDER BY ${sortByColumn} ${sortByDirection}
        LIMIT ${pageEnd} OFFSET ${pageStart}
    `;
    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.json(result);
});

app.listen(port, () => console.log(`API listening on port ${port}!`));

export default app;
