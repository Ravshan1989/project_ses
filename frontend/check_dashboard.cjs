
const { chromium } = require('playwright');
const path = require('path');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log('Navigating to http://localhost:5173/login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });

        console.log('Logging in...');
        await page.fill('input[placeholder="admin"]', 'admin'); // Use placeholder from LoginPage.tsx:340
        await page.fill('input[type="password"]', 'admin123');

        // Try to click by type or text
        const loginBtn = page.locator('button[type="submit"]');
        await loginBtn.click();

        console.log('Waiting for Dashboard...');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        await page.waitForTimeout(3000);

        const screenshotPath = path.join('C:', 'Users', 'Rasul', '.gemini', 'antigravity', 'brain', 'a5f5dafd-0589-4d2d-8e61-34c7b4c92f5f', 'dashboard_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved screenshot to: ${screenshotPath}`);
    } catch (e) {
        console.error('Failed to take dashboard screenshot:', e.message);
        const errorPath = path.join('C:', 'Users', 'Rasul', '.gemini', 'antigravity', 'brain', 'a5f5dafd-0589-4d2d-8e61-34c7b4c92f5f', 'error_screenshot.png');
        await page.screenshot({ path: errorPath, fullPage: true });
        console.log(`Saved error screenshot to: ${errorPath}`);
    } finally {
        await browser.close();
    }
}
run();
