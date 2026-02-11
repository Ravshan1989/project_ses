const https = require('https');
require('dotenv').config();

const token = process.env.BACKUP_BOT_TOKEN || '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';
const chatId = process.env.BACKUP_CHAT_ID || '-1003731709006';

const message = `
📊 *PROFESSOR MASLAHATI: TASHXIS VA MONITORING* 📊

🏛 *SARI nima?*
*SARI* (Severe Acute Respiratory Infection) — bu *Og'ir o'tkir respirator infektsiya* deb ataladi. 
Belgilari:
✅ Isitma (38°C dan yuqori)
✅ Yo'tal va nafas qisishi
✅ Shifoxonaga yotqizish talab etiladigan og'ir holat

---

⏱ *Tashxis qo'yish muddatlari:*

1️⃣ *Ekspress testlar:* 15–30 daqiqa (Skrining uchun).
2️⃣ *PZR (PCR) tahlili:* 6–24 soat (Oltin standart).
3️⃣ *IFA (ELISA):* 1–2 kun (Antitanachalarni aniqlash).
4️⃣ *Bakteriologik ekish:* 3–5 kun (Mikrob o'stirish).
5️⃣ *Klinik tashxis:* Darhol (SARI holatlari uchun).

💡 *Eslatma:* Kasallik tarqalishini oldini olishda birinchi 24 soat — eng muhim vaqt hisoblanadi.

📍 *Smart SES Monitoring System*
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
        console.log('Telegram Push Result:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(e);
    process.exit(1);
});

req.write(postData);
req.end();
