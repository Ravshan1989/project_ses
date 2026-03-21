const http = require('http');

const url = 'http://localhost:3007/api/v1/analysis/global-summary?startDate=2026-02-01&endDate=2026-02-28';

http.get(url, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            console.log('Response:', JSON.stringify(JSON.parse(data), null, 2).substring(0, 500) + '...');
        } catch (e) {
            console.log('Raw Response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
