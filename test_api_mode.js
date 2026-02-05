
const http = require('http');

async function checkEndpoint(url) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`URL: ${url}`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(`Response length/type: ${Array.isArray(json) ? json.length : typeof json}`);
                } catch (e) {
                    console.log('Response is not JSON');
                }
                console.log('---');
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error with ${url}:`, err.message);
            resolve();
        });
    });
}

async function run() {
    console.log('--- Verifying API via HTTP ---');
    const base = 'http://localhost:3007/api/v1';

    // 1. Daily Reports (Normal)
    await checkEndpoint(`${base}/daily-reports?date=2026-02-04`);

    // 2. Daily Reports (Test)
    await checkEndpoint(`${base}/daily-reports?date=2026-02-04&isTest=true`);

    // 3. Submissions (Test)
    await checkEndpoint(`${base}/submissions?period=2026-02-01&isTest=true`);
}

run();
