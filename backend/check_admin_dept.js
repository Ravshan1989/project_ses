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

        // Check admin's department level
        const res = await client.query(`
        SELECT d.name, d.level 
        FROM "users" u 
        JOIN "departments" d ON u."department_id" = d.id 
        WHERE u.username = 'admin'
    `);
        console.log('Admin Department Info:', res.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
