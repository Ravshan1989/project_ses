const bcrypt = require('./node_modules/bcrypt');
const { Client } = require('./node_modules/pg');

async function main() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'regionstat'
    });
    await client.connect();

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('admin1234', salt);

    const org = await client.query("SELECT id FROM organizations WHERE name = 'Toshkent viloyati' LIMIT 1");
    const orgId = org.rows[0]?.id;
    console.log('Org ID:', orgId);

    const result = await client.query(
        `INSERT INTO users (username, "passwordHash", role, organization_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO UPDATE SET "passwordHash" = $2
     RETURNING id, username, role`,
        ['admin', hash, 'ADMIN', orgId]
    );

    console.log('Admin created:', result.rows[0]);
    await client.end();
}

main().catch(console.error);
