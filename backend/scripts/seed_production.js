const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const REGION_DATA = [
    { name: "Nurafshon sh", population: 54100 },
    { name: "Angren sh", population: 191300 },
    { name: "Bekobod sh", population: 102000 },
    { name: "Chirchiq sh", population: 168000 },
    { name: "Olmaliq sh", population: 138500 },
    { name: "Ohangaron sh", population: 42000 },
    { name: "Yangiyo'l sh", population: 63000 },
    { name: "Oqqo'rg'on t", population: 112400 },
    { name: "Ohangaron t", population: 108300 },
    { name: "Bekobod t", population: 163400 },
    { name: "Bo'stonliq t", population: 175600 },
    { name: "Bo'ka t", population: 132400 },
    { name: "Quyi chirchiq t", population: 115800 },
    { name: "Zangiota t", population: 204300 },
    { name: "Yuqori Chirchiq t", population: 142100 },
    { name: "Qibray t", population: 206800 },
    { name: "Parkent t", population: 153000 },
    { name: "Piskent t", population: 102400 },
    { name: "O'rta Chirchiq t", population: 153500 },
    { name: "Chinoz t", population: 147800 },
    { name: "Yangiyo'l t", population: 278300 },
    { name: "Toshkent t", population: 194500 },
];

async function seed() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Create Department
        let deptResult = await client.query('SELECT id FROM departments WHERE name = $1', ['Boshqaruv (Admin)']);
        let deptId;
        if (deptResult.rows.length === 0) {
            deptResult = await client.query(
                `INSERT INTO departments (name, description, "isActive", level) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
                ['Boshqaruv (Admin)', 'System Administrator Department', true, 1]
            );
            deptId = deptResult.rows[0].id;
            console.log('Created Department:', deptId);
        } else {
            deptId = deptResult.rows[0].id;
            console.log('Exists Department:', deptId);
        }

        // 2. Create Parent Organization
        let parentResult = await client.query('SELECT id FROM organizations WHERE name = $1', ['Toshkent viloyati']);
        let parentId;
        if (parentResult.rows.length === 0) {
            parentResult = await client.query(
                `INSERT INTO organizations (name, population) VALUES ($1, $2) RETURNING id`,
                ['Toshkent viloyati', 3000000]
            );
            parentId = parentResult.rows[0].id;
            console.log('Created Parent Org:', parentId);
        } else {
            parentId = parentResult.rows[0].id;
            console.log('Exists Parent Org:', parentId);
        }

        // 3. Create Districts
        for (const data of REGION_DATA) {
            const orgCheck = await client.query('SELECT id FROM organizations WHERE name = $1', [data.name]);
            if (orgCheck.rows.length === 0) {
                await client.query(
                    `INSERT INTO organizations (name, population, child_population, parent_id) 
           VALUES ($1, $2, $3, $4)`,
                    [data.name, data.population, Math.round(data.population * 0.3), parentId]
                );
                console.log('Created Org:', data.name);
            } else {
                await client.query('UPDATE organizations SET population = $1 WHERE name = $2', [data.population, data.name]);
                console.log('Updated Org:', data.name);
            }
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err.stack);
    } finally {
        await client.end();
    }
}

seed();
