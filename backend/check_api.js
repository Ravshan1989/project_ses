const axios = require('axios');

async function checkApi() {
    try {
        console.log('Checking Executive Summary API...');
        const res = await axios.get('http://localhost:3007/api/v1/analysis/executive/summary');
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkApi();
