import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
});

export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};
