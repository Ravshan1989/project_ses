const https = require('https');

const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = '-1003731709006';

const message = `
📑 *LOYIHA YANGILANISHI VA REJA* 📑

✅ *AMALGA OSHIRILDI:*
- Tuman nomlari barcha hisobotlarda tarjima qilindi (Kirill alifbosi).
- Hisobot sahifalari dizayni va funksionalligi (Status/Verify) unifikatsiya qilindi.
- Avtomatik zaxiralash boti (Snapshot) Toshkent vaqtiga sozlandi.

📍 *KELAJAKDAGI REJALAR:*
- 💬 *Chat:* Tizim ichida xodimlar uchun jonli muloqot xonasi.
- 📹 *Videoselektor:* Masofaviy yig'ilishlar va video-aloqa (Jitsi Meet).
- 📊 *AI Bashoratlash:* Kasallikka moyillikni oldindan aniqlash.
- 📱 *Mobil Ilova:* Shifokorlar uchun maxsus mobil interfeys.

📅 Sana: ${new Date().toLocaleString('uz-UZ')}
🚀 Holat: Yangilanish kanalga yuborildi.
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
