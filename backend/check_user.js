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
        console.log('Connected to DB');

        // Find admin user
        const userRes = await client.query('SELECT id, username, role, "department_id" FROM "users" WHERE username = \'admin\'');
        if (userRes.rowCount === 0) {
            console.log('User admin not found');
            return;
        }
        const user = userRes.rows[0];
        console.log('User found:', user);

        if (user && user.department_id) {
            // Check department permissions
            const deptPerms = await client.query(`
            SELECT p.code 
            FROM "department_permissions" dp 
            JOIN "permissions" p ON dp."permission_id" = p.id 
            WHERE dp."department_id" = $1
        `, [user.department_id]);
            console.log('Department Permissions:', deptPerms.rows.map(r => r.code));
        } else {
            console.log('User has no department.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
