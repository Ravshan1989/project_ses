const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// NOTE: Update these with your DB credentials if not using environment variables
const dbConfig = {
    user: 'postgres',
    host: 'shinkansen.proxy.rlwy.net',
    database: 'railway',
    password: 'yKosJEzShgHdtHUZteXfnWbaSdFglplu',
    port: 29403,
    ssl: { rejectUnauthorized: false }
};

async function restore(backupFilePath) {
    if (!backupFilePath) {
        console.error('Iltimos, zaxira fayli yo\'lini ko\'rsating. Masalan: node restore_db.js backup.json');
        return;
    }

    const absolutePath = path.resolve(backupFilePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Fayl topilmadi: ${absolutePath}`);
        return;
    }

    const backupData = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log('Baza bilan aloqa o\'rnatildi.');

        // Disable triggers/constraints temporarily to avoid foreign key issues during mass insert
        await client.query('SET session_replication_role = "replica";');

        for (const [tableName, rows] of Object.entries(backupData)) {
            if (!rows || rows.length === 0) continue;

            console.log(`Jadvalni tozalash va tiklash: ${tableName}...`);
            await client.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);

            const columns = Object.keys(rows[0]);
            const columnsStr = columns.map(c => `"${c}"`).join(', ');

            for (const row of rows) {
                const values = columns.map(c => row[c]);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                await client.query(`INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders})`, values);
            }
        }

        // Re-enable triggers/constraints
        await client.query('SET session_replication_role = "origin";');
        console.log('✅ Ma\'lumotlar muvaffaqiyatli tiklandi!');

    } catch (err) {
        console.error('❌ Tiklashda xatolik:', err.message);
    } finally {
        await client.end();
    }
}

const fileArg = process.argv[2];
restore(fileArg);
