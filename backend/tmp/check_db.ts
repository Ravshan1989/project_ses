import { Client } from 'pg';

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'regionstat',
};

async function checkSpecificOrgs() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  try {
    const res = await client.query("SELECT * FROM organizations WHERE name ILIKE '%qabul%' OR name ILIKE '%reception%'");
    console.log('Reception-like organizations:', JSON.stringify(res.rows, null, 2));
  } finally {
    await client.end();
  }
}

checkSpecificOrgs().catch(console.error);
