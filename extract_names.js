const { Client } = require('pg');

async function extractNames() {
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

        console.log('--- DISEASES ---');
        const diseases = await client.query('SELECT name, code FROM diseases');
        console.log(JSON.stringify(diseases.rows, null, 2));

        console.log('--- TEMPLATES ---');
        const templates = await client.query('SELECT name, code, "schemaDefinition" FROM templates');
        console.log(JSON.stringify(templates.rows, null, 2));

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }
}

extractNames();
