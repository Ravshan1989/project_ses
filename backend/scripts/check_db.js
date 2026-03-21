const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const templates = await client.query("SELECT id, code, name FROM templates WHERE code = 'FORM1'");
        console.log('Templates found:', templates.rows);

        const orgs = await client.query("SELECT id, name FROM organizations");
        console.log('Organizations total:', orgs.rowCount);
        console.log('First 5 organizations:', orgs.rows.slice(0, 5));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
