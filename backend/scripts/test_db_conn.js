const { Client } = require('pg');

// Using connection string format
const connectionString = 'postgresql://postgres:yKosJEzShgHdtHUZteXfnWbaSdFglplu@shinkansen.proxy.rlwy.net:29403/railway';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
    .then(() => {
        console.log('Successfully connected to the database via URL');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Current time from DB:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err.stack);
        process.exit(1);
    });
