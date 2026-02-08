const https = require('https');

const token = '8563823032:AAHhCZhd1jg7wLoZZViYrCbJoQSdpeAnDn8';
const chatId = '474754475';

const message = "🚨🚨🚨 SOS XABARNOMASI (TEST) 🚨🚨🚨\n\n🏢 Tuman: Toshkent viloyati (TEST)\n🦠 Kasallik: Mock Test\n📊 Holat: Gumon qilinmoqda\n\n⚠️ Tizim muvaffaqiyatli tekshirildi.";

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
    res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
