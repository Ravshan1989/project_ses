const { Client } = require('pg');

async function inspectDb() {
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

        // Get all tables
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log('Tables found:', tables.join(', '));
        console.log('--- Row Counts ---');

        for (const table of tables) {
            try {
                const countRes = await client.query(`SELECT count(*) FROM "${table}"`);
                console.log(`${table}: ${countRes.rows[0].count}`);
            } catch (err) {
                console.log(`${table}: Error counting (${err.message})`);
            }
        }

    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }
}

inspectDb();
