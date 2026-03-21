const https = require('https');

// UZ: Backub bot (Zaxira boti) ma'lumotlari
const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = '-1003731709006'; // Kanal ID

const message = `
📜 *LOYIHA QOIDALARI (5 TA OLTIN QOIDA)* 📜
------------------------------------------
Ushbu qoidalar loyiha yakunlanqungacha (FINISHED) amal qiladi:

✅ *1. Append-only:* Kodni butunlay o'chirmaslik, originalni doim fayl oxirida kommentariya ichida saqlash.

✅ *2. No Unauthorized Push:* Sizning ruxsatingizsiz (kalit so'zlar: "Yukla", "Push", "Jo'nat") GitHub'ga yuklamaslik.

✅ *3. Backup Bot:* Kanalga ma'lumot yuborish so'ralganda, faqat **BACKKUB BOT** (Zaxira boti)dan foydalanish.

✅ *4. Consultation Mode:* "Gaplashamiza" so'zi aytilganda, ruxsatsiz kod yozmaslik, faqat muloqot rejimiga o'tish.

✅ *5. Daily Recap:* Har bir yangi seans boshida ushbu qoidalar eslatib o'tiladi.

------------------------------------------
📅 Ro'yxatdan o'tdi: ${new Date().toLocaleString()}
🛡️ Status: *QABUL QILINDI*
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
    res.on('end', () => console.log('Project Rules archived to BACKKUB Channel:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
