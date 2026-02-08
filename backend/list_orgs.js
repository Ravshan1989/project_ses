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

        const res = await client.query('SELECT name FROM organizations');
        console.log('Organization Names:', res.rows.map(r => r.name));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
