const axios = require('axios');

async function testEndpoint() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3007/api/v1/auth/login', {
            username: 'admin',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // 2. Request Export
        console.log('Testing Export Endpoint...');
        const exportUrl = 'http://localhost:3007/api/v1/exports/form1/excel?startDate=2025-12-01&endDate=2025-12-31&isTest=false';

        const res = await axios.get(exportUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer' // Expecting file
        });

        console.log(`Response Status: ${res.status}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Content-Length: ${res.headers['content-length']}`);

        if (res.status === 200 || res.status === 201) {
            console.log('SUCCESS: Endpoint is reachable and returning data.');
        } else {
            console.error('FAILURE: Endpoint returned unexpected status.');
        }

    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data.toString());
        }
    }
}

testEndpoint();
