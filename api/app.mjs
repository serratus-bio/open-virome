import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import * as db from './db/index.mjs';
import {
    getIdClauses,
    getMinimalJoinSubQuery,
    getTotalCountsQuery,
    getGroupedCountsByIdentifiers,
    getGroupedCountsByFilters,
    hasNoGroupByFilters,
    getCachedCountsQuery,
    getSearchStringClause,
} from './utils/queryBuilder.mjs';
import { getRequestBody, formatIdentifiersResponse } from './utils/format.mjs';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware.js';

const app = express();
const port = 8000;

app.use(express.json({ limit: '100mb' }));
app.use(cors());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(compression());

const runQuery = async (query) => {
    try {
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
    const table = body?.table || 'sra';
    const groupBy = body?.groupBy || undefined;
    const sortByColumn = body?.sortByColumn || undefined;
    const sortByDirection = body?.sortByDirection || undefined;
    const pageStart = body?.pageStart || 0;
    const pageEnd = body?.pageEnd || undefined;
    const searchString = body?.searchString || undefined;

    if (idColumn && filters.length > 0) {
        return res.status(400).json({ error: 'Cannot have both idColumn and filters!' });
    }

    let query = ``;

    if (!groupBy) {
        if (!idColumn) {
            return res.status(400).json({ error: 'groupBy is required!' });
        }
        query = getTotalCountsQuery({
            ids,
            idRanges,
            idColumn,
            table: table,
        });
    } else if (idColumn && ids.length > 0) {
        query = getGroupedCountsByIdentifiers({
            ids,
            idRanges,
            idColumn,
            groupBy,
            table: table,
        });
    } else if (hasNoGroupByFilters(filters, groupBy)) {
        query = getCachedCountsQuery(groupBy);
    } else {
        query = getGroupedCountsByFilters({
            filters,
            groupBy,
        });
    }

    query = `
        ${query}
        ${getSearchStringClause(searchString, filters, groupBy)}
        ${sortByColumn !== undefined ? `ORDER BY ${sortByColumn} ${sortByDirection}` : ''}
        ${pageEnd !== undefined ? `LIMIT ${pageEnd - pageStart} OFFSET ${pageStart}` : ''}
    `;

    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        console.error(query);
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
        return res.json(formatIdentifiersResponse([]));
    }
    const subquery = getMinimalJoinSubQuery(filters);
    const query = `
        SELECT run_id, bioproject, biosample
        FROM (${subquery}) as open_virome
    `;

    let result = await runQuery(query);

    if (result.error) {
        console.error(result.error);
        console.error(query);
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
    const table = body?.table || 'sra';
    const columns = body?.columns || '*';
    const pageStart = body?.pageStart || 0;
    const pageEnd = body?.pageEnd || undefined;

    const clauses = getIdClauses(ids, idRanges, idColumn, table);

    const query = `
        SELECT ${columns}
        FROM ${table}
        ${clauses.length > 0 ? `WHERE ${clauses.join(' OR ')}` : ''}
        ${pageEnd !== undefined ? `LIMIT ${pageEnd - pageStart} OFFSET ${pageStart}` : 'LIMIT 20000'}
    `;
    const result = await runQuery(query);
    if (result.error) {
        console.error(result.error);
        console.error(query);
        return res.status(500).json({ error: result.error });
    }
    return res.json(result);
});

app.listen(port, () => console.log(`API listening on port ${port}`));

export default app;
