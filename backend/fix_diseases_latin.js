const { Client } = require('pg');

const FIX_MAPPING = {
    "105": "Ichterlama va paratif bakteriyalarini tashuvchilari",
    "115": "Aniqlangan qo'zg'atuvchilar sabab bo'lgan enterit, kolit, gastroenteritlar, ovqat toksikoinfeksiyalari",
    "122": "Bo'g'ma qo'zg'atuvchi toksigen shtammlari tashuvchilari",
    "125": "shu jumladan tarqoq turi",
    "153": "Qu isitmasi",
    "157": "Yuqori va quyi nafas olish yo'llari o'tkir infeksiyalari (O'RI)",
    "202": "shu jumladan – v tom chisle: Chaqaloqlardagi yiringli septik infeksiyalar: omfalit, mastit, konyuktivit, sepsis, piodermiya, impetigo, po'rsildoq yara, osteomielit",
    "203": "Tuqqan ayollardagi yiringli septik kasalliklar: sepsis, mastit, akusherlik yarasining jarrohlik amaliyotidan keyingi infeksiyasi, tug'ruqdan keyingi yoyilgan infeksiya va boshqalar"
};

async function fixDiseases() {
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
        console.log('Connected to remote DB.');

        for (const [code, latinName] of Object.entries(FIX_MAPPING)) {
            const res = await client.query('UPDATE diseases SET name = $1 WHERE code = $2', [latinName, code]);
            if (res.affectedRows > 0 || res.rowCount > 0) {
                console.log(`✅ Updated code ${code} to Latin.`);
            } else {
                console.log(`⚠️ Code ${code} not found or no change needed.`);
            }
        }

        // Additional cleanup: Remove any remaining newlines or tabs in names globally
        await client.query("UPDATE diseases SET name = regexp_replace(name, '[\\r\\n\\t]+', ' ', 'g')");
        await client.query("UPDATE diseases SET name = trim(regexp_replace(name, '  +', ' ', 'g'))");
        console.log('Global cleanup (newlines/spaces) completed.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

fixDiseases();
