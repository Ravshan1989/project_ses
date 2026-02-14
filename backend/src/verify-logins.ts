import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/auth/login';

const USERS = [
  { username: 'user_nurafshon_sh', password: 'ses12345' },
  { username: 'user_angren_sh', password: 'ses12345' },
  { username: 'user_bekobod_sh', password: 'ses12345' },
  { username: 'user_chirchiq_sh', password: 'ses12345' },
  { username: 'user_olmaliq_sh', password: 'ses12345' },
  { username: 'user_ohangaron_sh', password: 'ses12345' },
  { username: 'user_yangiyol_sh', password: 'ses12345' },
  { username: 'user_oqqorgon_t', password: 'ses12345' },
  { username: 'user_ohangaron_t', password: 'ses12345' },
  { username: 'user_bekobod_t', password: 'ses12345' },
  { username: 'user_bostonliq_t', password: 'ses12345' },
  { username: 'user_boka_t', password: 'ses12345' },
  { username: 'user_quyi_chirchiq_t', password: 'ses12345' },
  { username: 'user_zangiota_t', password: 'ses12345' },
  { username: 'user_yuqori_chirchiq_t', password: 'ses12345' },
  { username: 'user_qibray_t', password: 'ses12345' },
  { username: 'user_parkent_t', password: 'ses12345' },
  { username: 'user_piskent_t', password: 'ses12345' },
  { username: 'user_orta_chirchiq_t', password: 'ses12345' },
  { username: 'user_chinoz_t', password: 'ses12345' },
  { username: 'user_yangiyol_t', password: 'ses12345' },
  { username: 'user_toshkent_t', password: 'ses12345' },
  // Bostonliq maxsus
  { username: 'bostonliq_head', password: 'Ses12345!' },
  { username: 'bostonliq_chief', password: 'Ses12345!' },
  { username: 'bostonliq_staff1', password: 'Ses12345!' },
  { username: 'bostonliq_staff2', password: 'Ses12345!' },
  { username: 'bostonliq_staff3', password: 'Ses12345!' },
];

async function checkLogins() {
  console.log(`Checking ${USERS.length} users...`);
  let successCount = 0;
  let failCount = 0;

  for (const user of USERS) {
    try {
      const response = await axios.post(API_URL, {
        username: user.username,
        password: user.password
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ OK: ${user.username}`);
        successCount++;
      } else {
        console.log(`❌ FAIL: ${user.username} (Status: ${response.status})`);
        failCount++;
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${user.username} - ${error.message}`);
      failCount++;
    }
  }

  console.log(`\nResult: ${successCount} successful, ${failCount} failed.`);
}

checkLogins();
