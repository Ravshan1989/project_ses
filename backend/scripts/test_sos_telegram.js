const https = require('https');

const token = '8563823032:AAHhCZhd1jg7wLoZZViYrCbJoQSdpeAnDn8';
const chatId = '474754475';

const data = {
    id: 'TEST-SOS-123',
    organizationName: 'Toshkent viloyati (TEST)',
    diseaseName: 'O\'rmon grippi (Mock Test)',
    status: 'Gumon qilinmoqda',
    date: new Date().toLocaleString('uz-UZ'),
    comment: 'Bu tizimning ishlashini tekshirish uchun yuborilgan test xabari.'
};

const message = `
🚨🚨🚨 *SOS XABARNOMASI* 🚨🚨🚨
🔴 *Daraja:* FAVQULODDA (TEST)
🏢 *Tuman/Shahar:* ${data.organizationName}
🦠 *Kasallik:* ${data.diseaseName}
📊 *Holat turi:* ${data.status}
📅 *Sana va vaqt:* ${data.date}
🆔 *SOS ID:* ${data.id}

📝 *Izoh:* ${data.comment || "Yo'q"}

⚠️ *DIQQAT:* Ushbu xabar tizimni tekshirish uchun yuborildi.
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
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
        console.log('Telegram API Response:', responseData);
    });
});

req.on('error', (e) => {
    console.error('Xatolik:', e);
});

req.write(postData);
req.end();
