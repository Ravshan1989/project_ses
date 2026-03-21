const { Client } = require('pg');

async function checkDiseases() {
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
        const res = await client.query("SELECT code, name FROM diseases WHERE name ~ '[а-яА-Я]' ORDER BY code ASC");
        console.log('--- CYRILLIC DISEASES ---');
        res.rows.forEach(row => {
            console.log(`${row.code}: ${JSON.stringify(row.name)}`);
        });
        console.log('--- END ---');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkDiseases();
