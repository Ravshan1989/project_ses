
const { chromium } = require('playwright');
const path = require('path');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log('Navigating to http://localhost:5173/...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for potential redirect or content
        await page.waitForTimeout(3000);

        const screenshotPath = path.join('C:', 'Users', 'Rasul', '.gemini', 'antigravity', 'brain', 'a5f5dafd-0589-4d2d-8e61-34c7b4c92f5f', 'app_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved screenshot to: ${screenshotPath}`);
    } catch (e) {
        console.error('Failed to take screenshot:', e.message);
    } finally {
        await browser.close();
    }
}
run();
