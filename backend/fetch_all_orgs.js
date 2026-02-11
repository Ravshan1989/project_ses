const { Client } = require('pg');
const fs = require('fs');

async function fetchOrgs() {
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
        const res = await client.query('SELECT name FROM organizations WHERE parent_id IS NOT NULL ORDER BY name ASC');
        fs.writeFileSync('org_list.json', JSON.stringify(res.rows, null, 2));
        console.log(`Fetched ${res.rows.length} organizations.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fetchOrgs();
