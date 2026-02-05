const API_URL = 'http://localhost:3007/api/v1';

async function testVulnerability() {
    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123' // Found in seed-admin.ts
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        console.log('Login successful. Token:', loginData.access_token ? 'Received' : 'Missing');
        const token = loginData.access_token;

        // 2. Fetch Users
        console.log('Fetching users...');
        const usersRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!usersRes.ok) {
            throw new Error(`Users fetch failed: ${usersRes.status} ${usersRes.statusText}`);
        }

        const usersData = await usersRes.json();
        console.log('Users fetched successfully');
        console.log('Users count:', usersData.length);
        console.log('Data sample:', JSON.stringify(usersData[0], null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testVulnerability();
