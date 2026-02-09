const https = require('https');

const token = '8563823032:AAHhCZhd1jg7wLoZZViYrCbJoQSdpeAnDn8';
const chatId = '474754475';

const message = `
🛡️ *TIZIM XAVFSIZLIK HISOBOTI (AUDIT)* 🛡️

Loyiha xavfsizlik darajasi: *YUQORI (Enterprise)*

✅ *1. JWT Authentication:* Barcha so'rovlar shifrlangan tokenlar orqali himoyalangan. Begona shaxs ma'lumotlarga kira olmaydi.

✅ *2. RBAC Nazorati:* Qat'iy iyerarxiya va ruxsatnomalar tizimi. Har bir xodim faqat o'z vakolatidagi ma'lumotni ko'radi/o'zgartiradi.

✅ *3. Global Validation:* Serverga kelayotgan har bir raqam mantiqiy süzgichdan o'tadi (SQL Injection va format xatolari bloklanadi).

✅ *4. Audit Trail:* Har bir amal (UPDATE/DELETE/CREATE) sekundigacha qayd etiladi. Kim, qachon va nima uchun o'zgartirganini kuzatish imkoniyati bor.

✅ *5. Tarmoq Himoyasi:* CORS va Payload limitlari o'rnatilgan. Tashqi botlar va hujumlardan himoya mavjud.

🚀 *Xulosa:* Tizim zamonaviy tibbiy-statistika standartlariga to'liq muvofiq.
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
    res.on('end', () => console.log('Security Report Archived:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
