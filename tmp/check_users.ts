import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../backend/src/modules/users/entities/user.entity';

dotenv.config({ path: './backend/.env' });

async function checkUsers() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User],
    ssl: { rejectUnauthorized: false }
  });

  try {
    await ds.initialize();
    const users = await ds.getRepository(User).find({
      take: 5,
      select: ['id', 'username', 'firstName', 'lastName']
    });
    console.log('--- USER DATA ---');
    console.log(JSON.stringify(users, null, 2));
    await ds.destroy();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();
