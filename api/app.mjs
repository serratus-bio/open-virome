import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as db from './db/index.mjs'
import 'dotenv/config'

const app = express();
const port = 8000

app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

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
  }
  catch (e) {
    return { error: JSON.stringify(e) };
  }
}

app.post("/counts", async (req, res) => {
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

  let clauses = [
    `${groupBy} IS NOT NULL`
  ]

  if (queryString !== undefined) {
    clauses = [
      ...clauses,
      `${groupBy} LIKE '%${queryString}%'`
    ]
  }

  if (Object.keys(filters).length > 0) {
    const filterTypes = filters.map(filter => filter.filterType);

    filterTypes.forEach(filterType => {
      const filterValues = filters.filter(filter => filter.filterType === filterType).map(filter => filter.filterValue);
      const filterClauses = filterValues.map(filterValue => `${filterType} = '${filterValue}'`);
      clauses = [
        ...clauses,
        `(${filterClauses.join(' OR ')})`
      ]
    });
  }

  const query = `
    SELECT ${groupBy} as name, COUNT(*) as count
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


app.post("/runs", async (req, res) => {
  const body = req.body;

  if (body === undefined) {
    return res.status(400).json({ error: 'Invalid request!' });
  }

  const filters = body?.filters || [];
  const queryString = body?.queryString || undefined;
  const sortByDirection = body?.sortByDirection || 'desc';

  let clauses = [
    `run_id IS NOT NULL`
  ]

  if (queryString !== undefined) {
    clauses = [
      ...clauses,
      `${groupBy} LIKE '%${queryString}%'`
    ]
  }

  if (Object.keys(filters).length > 0) {
    const filterTypes = filters.map(filter => filter.filterType);

    filterTypes.forEach(filterType => {
      const filterValues = filters.filter(filter => filter.filterType === filterType).map(filter => filter.filterValue);
      const filterClauses = filterValues.map(filterValue => `${filterType} = '${filterValue}'`);
      clauses = [
        ...clauses,
        `(${filterClauses.join(' OR ')})`
      ]
    });
  }

  const query = `
    SELECT distinct run_id
    FROM open_virome
    ${clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''}
    ORDER BY run_id ${sortByDirection}
  `;

  const result = await runQuery(query);

  if (result.error) {
    console.error(result.error);
    return res.status(500).json({ error: result.error });
  }
  return res.json(result);
});



app.post("/results", async (req, res) => {
  const body = req.body;
  if (body === undefined) {
    return res.status(400).json({ error: 'Invalid request!' });
  }

  const filters = body?.filters || {};
  const table = body?.table || 'rfamily2';
  const columns = body?.columns || '*';
  const sortByColumn = body?.sortByColumn || 'count';
  const sortByDirection = body?.sortByDirection || 'desc';
  const pageStart = body?.pageStart || 0;
  const pageEnd = body?.pageEnd || 10;

  const query = `
    SELECT ${columns}
    FROM ${table}
    ${Object.keys(filters).length > 0
      ?  `WHERE ${Object.keys(filters).map(key => `${key} = '${filters[key]}'`).join(' AND ')}`
      : ''}
    -- ORDER BY ${sortByColumn} ${sortByDirection}
    LIMIT ${pageEnd} OFFSET ${pageStart}
  `;
  const result = await runQuery(query);
  if (result.error) {
    console.error(result.error);
    return res.status(500).json({ error: result.error });
  }
  return res.json(result);
})


app.listen(port, () => console.log(`API listening on port ${port}!`))

export default app;