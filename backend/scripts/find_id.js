const https = require('https');

const token = '8304666738:AAG-3fK2-SVzIwexP67iuu8Oh8Q3-gS0p5k';

function getUpdates() {
    https.get(`https://api.telegram.org/bot${token}/getUpdates`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('API Response:', data);
            const result = JSON.parse(data);
            if (result.ok && result.result.length > 0) {
                result.result.forEach(update => {
                    const chat = update.message ? update.message.chat : (update.channel_post ? update.channel_post.chat : (update.my_chat_member ? update.my_chat_member.chat : null));
                    if (chat) {
                        console.log(`\nChat Nomi: ${chat.title || chat.username || 'Private'}`);
                        console.log(`Chat ID: ${chat.id}`);
                        console.log(`Tur: ${chat.type}`);
                    }
                });
            } else {
                console.log('Hozircha yangi xabarlar yo\'q.');
            }
        });
    }).on('error', (err) => {
        console.error('Xatolik:', err.message);
    });
}

getUpdates();
