import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as db from './db/index.mjs';
import 'dotenv/config';
import { getIdClauses, getMinimalJoinSubQuery, handleIdKeyIrregularities } from './utils/queryBuilder.mjs';
import { getRequestBody, formatIdentifiersResponse } from './utils/format.mjs';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware.js';

const app = express();
const port = 8000;

app.use(cors());

app.use(awsServerlessExpressMiddleware.eventContext());
app.use(bodyParser.json());
app.use(express.json({ limit: '100mb' }));
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

const runQuery = async (query) => {
    try {
        console.log(query);
        const result = await db.query(query);
        return result.rows;
    } catch (e) {
        return { error: JSON.stringify(e) };
    }
};

app.post('/counts', async (req, res) => {
    const body = getRequestBody(req);

    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const idColumn = body?.idColumn || undefined;
    const ids = body?.ids || [];
    const idRanges = body?.idRanges || [];

    const filters = body?.filters || [];
    const groupBy = body?.groupBy || undefined;
    const sortByColumn = body?.sortByColumn || 'count';
    const sortByDirection = body?.sortByDirection || 'desc';
    const pageStart = body?.pageStart || undefined;
    const pageEnd = body?.pageEnd || undefined;

    if (groupBy === undefined) {
        return res.status(400).json({ error: 'groupBy is required!' });
    }
    if (idColumn && filters.length > 0) {
        return res.status(400).json({ error: 'Cannot have both idColumn and filters!' });
    }

    const includeCounts = filters.filter((filter) => filter.filterType !== groupBy).length > 0;

    let query = ``;
    if (idColumn) {
        let clauses = getIdClauses(ids, idRanges, idColumn, 'srarun');
        let remappedGroupBy = handleIdKeyIrregularities(groupBy, 'srarun');
        clauses = `${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}`;
        query = `
            SELECT ${remappedGroupBy} as name, COUNT(*) as count
            FROM srarun
            ${clauses}
            GROUP BY ${remappedGroupBy}
            ${includeCounts ? `ORDER BY ${sortByColumn} ${sortByDirection}` : ''}
            ${pageEnd !== undefined ? `LIMIT ${pageEnd} OFFSET ${pageStart}` : ''}
        `;
    } else {
        const subquery = getMinimalJoinSubQuery(filters, groupBy);
        query = `
            SELECT ${groupBy} as name${includeCounts ? `, COUNT(*) as count` : ''}
            FROM (${subquery}) as open_virome
            GROUP BY ${groupBy}
            ${includeCounts ? `ORDER BY ${sortByColumn} ${sortByDirection}` : ''}
            ${pageEnd !== undefined ? `LIMIT ${pageEnd} OFFSET ${pageStart}` : ''}
        `;
    }

    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.json(result);
});

app.post('/identifiers', async (req, res) => {
    const body = getRequestBody(req);

    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const filters = body?.filters || [];

    if (filters.length === 0) {
        return res.status(400).json({ error: 'filters is required!' });
    }

    const subquery = getMinimalJoinSubQuery(filters);
    const query = `
        SELECT run_id, bioproject, biosample
        FROM (${subquery}) as open_virome
    `;

    let result = await runQuery(query);

    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }

    result = formatIdentifiersResponse(result);
    return res.json(result);
});

app.post('/results', async (req, res) => {
    const body = getRequestBody(req);
    if (body === undefined) {
        return res.status(400).json({ error: 'Invalid request!' });
    }

    const idColumn = body?.idColumn || 'run_id';
    const ids = body?.ids || [];
    const idRanges = body?.idRanges || [];
    const table = body?.table || 'rfamily2';
    const columns = body?.columns || '*';
    const pageStart = body?.pageStart || 0;
    const pageEnd = body?.pageEnd || 10;

    const clauses = getIdClauses(ids, idRanges, idColumn, table);

    const query = `
        SELECT ${columns}
        FROM ${table}
        ${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}
        LIMIT ${pageEnd} OFFSET ${pageStart}
    `;
    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        return res.status(500).json({ error: result.error });
    }
    return res.json(result);
});

app.listen(port, () => console.log(`API listening on port ${port}`));

export default app;
