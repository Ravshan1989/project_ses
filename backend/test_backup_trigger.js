const { Client } = require('pg');
const https = require('https');

// CONFIG
const dbConfig = {
    user: 'postgres',
    host: 'shinkansen.proxy.rlwy.net',
    database: 'railway',
    password: 'yKosJEzShgHdtHUZteXfnWbaSdFglplu',
    port: 29403,
    ssl: { rejectUnauthorized: false }
};

const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = '-1003731709006';

async function testBackup() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Bazaga ulanildi...');

        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tables = tablesRes.rows.map(r => r.table_name);
        const backupData = {};

        for (const table of tables) {
            if (table.includes('migrations')) continue;
            const data = await client.query(`SELECT * FROM "${table}"`);
            backupData[table] = data.rows;
        }

        const jsonData = JSON.stringify(backupData, null, 2);
        const buffer = Buffer.from(jsonData, 'utf-8');
        console.log('Ma\'lumotlar eksport qilindi. Kanalga yuboryapman...');

        // Sending via simple multipart/form-data manually to avoid extra dependencies if possible
        // But since I'm in the backend env, I might have axios or something.
        // Let's use a simple boundary approach with https.

        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const filename = `manual-test-backup.json`;

        const postData =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n` +
            `Content-Type: application/json\r\n\r\n` +
            jsonData + `\r\n` +
            `--${boundary}--\r\n`;

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${token}/sendDocument`,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => {
                const response = JSON.parse(resData);
                if (response.ok) {
                    console.log('✅ Muvaffaqiyatli yuborildi! Kanalni tekshiring.');
                } else {
                    console.log('❌ Xatolik:', response.description);
                }
            });
        });

        req.on('error', (e) => console.error('Req error:', e));
        req.write(postData);
        req.end();

    } catch (err) {
        console.error('DB error:', err.message);
    } finally {
        await client.end();
    }
}

testBackup();
