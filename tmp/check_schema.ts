import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkSchema() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await ds.initialize();
    const result = await ds.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('--- USERS TABLE COLUMNS ---');
    console.log(result.map((c: any) => c.column_name).join(', '));
    await ds.destroy();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkSchema();
