
const { chromium } = require('playwright');
const path = require('path');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to http://localhost:3001/');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 });

        console.log('Page Title:', await page.title());
        const content = await page.content();
        console.log('Page Content Length:', content.length);
        console.log('Snippet:', content.substring(0, 500));

        await page.screenshot({ path: 'root_page.png' });
        console.log('Saved root_page.png');

    } catch (e) {
        console.error('Check failed:', e.message);
    } finally {
        await browser.close();
    }
}

run();
