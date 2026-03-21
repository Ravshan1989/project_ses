const { Client } = require('pg');

async function getSamples() {
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

        console.log('--- Sample Diseases (first 5) ---');
        const diseases = await client.query('SELECT name FROM diseases LIMIT 5');
        console.log(diseases.rows.map(r => r.name));

        console.log('--- Sample Organizations (first 5) ---');
        const orgs = await client.query('SELECT name FROM organizations LIMIT 5');
        console.log(orgs.rows.map(r => r.name));

        console.log('--- Sample SOS Diseases ---');
        const sos = await client.query('SELECT name FROM sos_diseases');
        console.log(sos.rows.map(r => r.name));

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }
}

getSamples();
