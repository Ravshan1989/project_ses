
const { chromium } = require('playwright');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

    try {
        console.log('Navigating to http://localhost:3001/login...');
        await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });

        await page.fill('input[placeholder="admin"]', 'admin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button:has-text("Kirish")');

        await page.waitForURL('**/dashboard');
        console.log('LoggedIn to Dashboard');

        console.log('Navigating to http://localhost:3001/disease/daily-hepatitis...');
        await page.goto('http://localhost:3001/disease/daily-hepatitis', { waitUntil: 'load' });

        await page.waitForTimeout(5000);
        console.log('Taking final debug screenshot...');
        await page.screenshot({ path: 'debug_final_console.png' });

    } catch (e) {
        console.error('Script failed:', e.message);
    } finally {
        await browser.close();
    }
}

run();
