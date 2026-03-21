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
        const res = await client.query('SELECT count(*) FROM users');
        console.log('Total users:', res.rows[0].count);
        const nurafshon = await client.query('SELECT username FROM users WHERE username = $1', ['user_nurafshon_sh']);
        console.log('User user_nurafshon_sh exists:', nurafshon.rowCount > 0);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}
run();
