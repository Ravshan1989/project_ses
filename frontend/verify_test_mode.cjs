
const { chromium } = require('playwright');
const path = require('path');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to http://localhost:3001/login...');
        await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 30000 });

        console.log('Logging in...');
        await page.fill('input[placeholder="admin"]', 'admin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button:has-text("Kirish")');

        console.log('Waiting for Dashboard...');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        console.log('Navigating to http://localhost:3001/daily-reports...');
        await page.goto('http://localhost:3001/daily-reports', { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for the switch
        console.log('Waiting for Test Mode switch...');
        const switchSelector = '.ant-switch';
        await page.waitForSelector(switchSelector, { timeout: 15000 });

        // Let the page settle
        await page.waitForTimeout(1000);

        // Toggle Test Mode
        console.log('Toggling Test Mode...');
        await page.click(switchSelector);

        // Wait for the Alert banner (DIQQAT: TEST REJIMI FAOL)
        console.log('Waiting for Alert banner...');
        await page.waitForSelector('.ant-alert-error', { timeout: 10000 });

        // Final screenshot
        const screenshotPath = path.resolve('test_mode_final_verified.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved screenshot to: ${screenshotPath}`);

    } catch (e) {
        console.error('Test failed:', e.message);
    } finally {
        await browser.close();
    }
}

run();
