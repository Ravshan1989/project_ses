const { Client } = require('pg');

async function checkDb() {
    const client = new Client({
        user: 'postgres',
        host: 'shinkansen.proxy.rlwy.net',
        database: 'railway',
        password: 'yKosJEzShgHdtHUZteXfnWbaSdFglplu',
        port: 29403,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT count(*) FROM hepatitis_daily_reports');
        console.log('Total Hepatitis Reports:', res.rows[0].count);

        const res2 = await client.query('SELECT name, population FROM organizations WHERE population > 0 LIMIT 5');
        console.log('Orgs with population:', res2.rows);

        const res3 = await client.query('SELECT * FROM hepatitis_daily_reports ORDER BY "reportDate" DESC LIMIT 3');
        console.log('Latest reports:', res3.rows);

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
