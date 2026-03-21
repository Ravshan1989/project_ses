const { Client } = require('pg');

async function checkUser() {
  const client = new Client({
    connectionString: 'postgresql://project_ses_user:9O1Yv1nThXnC36LzN6BFrx6P45JpQYF2@dpg-cv66csqj1k6c73eqof1g-a.oregon-postgres.render.com/project_ses?ssl=true'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query('SELECT id, username, "phoneNumber", "telegramChatId" FROM users');
    console.log('All users phone numbers and Telegram IDs:');
    res.rows.forEach(row => {
        console.log(`- User: ${row.username} | Phone: ${row.phoneNumber} | TG ID: ${row.telegramChatId}`);
    });

    // Specifically search for the testing number
    const searchRes = await client.query('SELECT id, username, "phoneNumber", "telegramChatId" FROM users WHERE "phoneNumber" LIKE $1', ['%7361812%']);
    console.log('\nSearch result for 7361812:');
    console.log(searchRes.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkUser();
