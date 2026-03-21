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

        const res = await client.query('SELECT code FROM permissions');
        console.log('Permission Codes:', res.rows.map(r => r.code));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
