const https = require('https');

const token = '8563823032:AAHhCZhd1jg7wLoZZViYrCbJoQSdpeAnDn8';
const chatId = '474754475';

const message = `
📋 *SHAKL 1: ISH HAJMINI 50% GA QISQARTIRISH REJASI* 📋

Foydalanuvchilarning ishini osonlashtirish uchun yangi algoritm:

✅ *Mantiq:* 
Foydalanuvchi 2026-yil fevralni tanlasa, tizim 2025-yil fevral raqamlarini o'zi topib, "O'tgan yil" ustuniga tayyor qilib qo'yadi.

✅ *Qulayliklar:*
1. Foydalanuvchi o'tgan yilgi raqamlarni qidirib yurmaydi.
2. Excel shabloni ikki baravar qisqaradi (faqat joriy yil ustuni qoladi).
3. O'tgan yilgi raqamlar bloklanadi (o'zgartirib bo'lmaydi), bu xatolarni oldini oladi.

🚀 *Ijro:* 
Ertaga 2025-yil ma'lumotlari yuklangandan so'ng, ushbu "Aqlli to'ldirish" funksiyasini yoqamiz.
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
