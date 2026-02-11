const https = require('https');

// UZ: Backub bot (Zaxira boti) ma'lumotlari
const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = '-1003731709006'; // Kanal ID

const message = `
📱 *YANGI BOSQICH: MOBIL ILOVA ISHLAB CHIQISH* 📱
------------------------------------------
Loyiha: *Smart SES Mobile*
Holat: *BOSHLANDI (INITIALIZING)*

✅ *1. Texnologiya:* React Native (Expo) - Native unumdorlik va tezkor rivojlanish uchun tanlandi.
✅ *2. Maqsad:* Tizimdan foydalanishni osonlashtirish, inspektorlar uchun qulay kunlik hisobot yuborish interfeysi.
✅ *3. Integratsiya:* Mavjud Backend API bilan to'liq integratsiya qilinadi.
✅ *4. Xavfsizlik:* Web versiyadagi barcha xavfsizlik protokollari (JWT, RBAC) mobil ilovada ham qo'llaniladi.

🚀 *Xulosa:* Mobil ilova loyiha qamrovini kengaytiradi va foydalanuvchilar sonini oshiradi.
------------------------------------------
📅 Sana: ${new Date().toLocaleString()}
📍 Auditchi: Antigravity AI
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
    res.on('end', () => {
        console.log('Mobile Start Audit sent to BACKKUB Channel:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(e);
    process.exit(1);
});

req.write(postData);
req.end();
