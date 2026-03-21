
import { Client } from 'pg';

async function listOrgs() {
    const client = new Client({
        connectionString: "postgresql://postgres:postgres@localhost:5432/regionstat"
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, name, parent_id FROM organizations');
        console.log('Organizations in DB:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error fetching orgs:', err);
    } finally {
        await client.end();
    }
}

listOrgs();
