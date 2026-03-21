const { Client } = require('pg');
const fs = require('fs');

async function fetchDiseases() {
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
        const res = await client.query('SELECT code, name FROM diseases ORDER BY code::integer ASC');
        fs.writeFileSync('disease_list.json', JSON.stringify(res.rows, null, 2));
        console.log(`Fetched ${res.rows.length} diseases.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fetchDiseases();
