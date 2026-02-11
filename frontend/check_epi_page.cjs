
const { chromium } = require('playwright');
const path = require('path');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        console.log('Navigating to http://localhost:5173/login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });

        await page.fill('input[placeholder="admin"]', 'admin');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');

        console.log('Waiting for Dashboard...');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        console.log('Navigating to http://localhost:5173/daily-reports/epidemiology...');
        // The URL for epidemiology daily reports in this app might be different. 
        // Based on the sidebar in the dashboard, it's under "Ma'lumot kiritish" maybe?
        // Let's try direct navigation.
        await page.goto('http://localhost:5173/daily-reports/epidemiology', { waitUntil: 'networkidle', timeout: 30000 });

        await page.waitForTimeout(3000);

        const screenshotPath = path.join('C:', 'Users', 'Rasul', '.gemini', 'antigravity', 'brain', 'a5f5dafd-0589-4d2d-8e61-34c7b4c92f5f', 'epi_page_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved screenshot to: ${screenshotPath}`);
    } catch (e) {
        console.error('Failed to take epi page screenshot:', e.message);
        const errorPath = path.join('C:', 'Users', 'Rasul', '.gemini', 'antigravity', 'brain', 'a5f5dafd-0589-4d2d-8e61-34c7b4c92f5f', 'epi_error_screenshot.png');
        await page.screenshot({ path: errorPath, fullPage: true });
    } finally {
        await browser.close();
    }
}
run();
