import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const API_URL = "http://localhost:3007/api/v1"; // Current backend port from main.ts

async function testApi() {
  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin', // Assuming admin exists
      password: 'admin'  // Assuming default password or similar
    });
    
    const token = loginRes.data.access_token;
    console.log('Token obtained.');

    // 2. Fetch users
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('--- FIRST USER DATA FROM API ---');
    console.log(JSON.stringify(usersRes.data[0], null, 2));
    
  } catch (err: any) {
    console.error('API Test Error:', err.response?.data || err.message);
  }
}

testApi();
