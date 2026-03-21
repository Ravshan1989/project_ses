const https = require('https');

const token = '8563823032:AAHhCZhd1jg7wLoZZViYrCbJoQSdpeAnDn8';
const chatId = '474754475';

const message = `
🚀 *SES LOYIHASI: KELAJAKDAGI REJA (ROADMAP)* 🚀

Ushbu hujjat loyihani rivojlantirish bo'yicha uzoq muddatli rejadir:

1️⃣ *Vizualizatsiya va GIS (Xarita):*
• Viloyat xaritasida kasallanish o'choqlarini ko'rish (Heatmaps).
• Markaziy boshqaruv uchun jonli grafiklar (Live Dashboards).

2️⃣ *Sun'iy Intellekt va Bashoratlash (AI/ML):*
• Trendlarni tahlil qilish va kelajakni bashorat qilish.
• Kasallanish ortishini erta aniqlash va SOS ogohlantirishlari.

3️⃣ *Mobil Ilova va Bot:*
• Shifokorlar uchun qulay mobil interfeys (Field app).
• SOS va hisobotlar uchun interaktiv Telegram Bot.

4️⃣ *Xavfsizlik va Nazorat:*
• Audit Logs (kim, qachon, nima o'zgartirdi).
• Excel ma'lumotlarini aqlli tekshirish (Data Validation).

5️⃣ *Avtomatlashtirilgan Hisobotlar:*
• Haftalik tahlillarni PDF/Excel ko'rinishida generatsiya qilish.
• Avtomatik Email/Telegram dispatch tizimi.

---
💡 *Eslatma: Ushbu rejani ertangi taqdimotda foydalanish tavsiya etiladi.*
`;

const postData = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
});

const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Telegram Push Result:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
