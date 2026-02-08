const https = require('https');

const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = '-1003731709006';

const message = `
📑 *LOYIHA REJASI (ARXIV/KANAL)* 📑

Ushbu reja loyihaning kelajakdagi rivojlanish bosqichlarini belgilaydi:

📍 *1. GIS & Xaritalar:* Hududiy tahlil va interaktiv xaritalar.
📍 *2. Bashoratlash:* AI orqali kasallanish trendlarini aniqlash.
📍 *3. Mobil & Bot:* Shifokorlar uchun ilova va Telegram xizmatlari.
📍 *4. Nazorat:* Ma'lumotlar auditi va qat'iy tekshiruv.
📍 *5. Hisobotlar:* Avtomatlashtirilgan PDF va Email tizimi.

📅 Sana: ${new Date().toLocaleString('uz-UZ')}
✅ Holat: Tasdiqlandi
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
    res.on('end', () => console.log('Backup Channel Push Result:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
