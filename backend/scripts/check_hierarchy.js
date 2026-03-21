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

        // Check organization parent
        const orgRes = await client.query('SELECT name, "parent_id" FROM "organizations" WHERE name = \'Toshkent viloyati\'');
        console.log('Organization:', orgRes.rows[0]);

        // Check department level
        const deptRes = await client.query('SELECT name, level FROM "departments" WHERE name = \'Epidemiologiya\'');
        console.log('Department:', deptRes.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
