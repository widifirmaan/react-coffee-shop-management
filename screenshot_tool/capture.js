
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📸 Starting screenshot capture...');

    try {
        // 1. Landing Page (CMS)
        await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
        await wait(2000);
        await page.screenshot({ path: path.join(OUT_DIR, '01_landing.png') });
        console.log('✓ Landing Page captured');

        // 2. Order Page (Customer)
        await page.goto(`${BASE_URL}/order`, { waitUntil: 'networkidle2' });
        await wait(2000);
        await page.screenshot({ path: path.join(OUT_DIR, '02_order_page.png') });
        console.log('✓ Order Page captured');

        // 3. Kitchen Display (Public View?)
        // Note: Kitchen might require login if protected. 
        // Checking App.jsx: /kitchen needs 'user'.
        // So I must login first for Kitchen.

        // 4. Login Page
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
        await wait(1000);
        await page.screenshot({ path: path.join(OUT_DIR, '04_login.png') });
        console.log('✓ Login Page captured');

        // 5. Perform Login
        console.log('... Logging in ...');
        await page.type('input[type="text"]', 'manager');
        await page.type('input[type="password"]', 'password123');

        // Click Login
        await page.evaluate(() => {
            const buttons = [...document.querySelectorAll('button')];
            const loginBtn = buttons.find(b => b.innerText.includes('ENTER SYSTEM'));
            if (loginBtn) loginBtn.click();
        });

        // Wait for Dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await wait(3000); // Wait for stats to load

        // 5. Dashboard
        if (page.url().includes('dashboard')) {
            await page.screenshot({ path: path.join(OUT_DIR, '05_dashboard.png') });
            console.log('✓ Dashboard captured');
        } else {
            console.error('Failed to reach dashboard, url: ' + page.url());
        }

        // 3. Kitchen (Now Logged In)
        await page.goto(`${BASE_URL}/kitchen`, { waitUntil: 'networkidle2' });
        await wait(5000); // Give time for orders to fetch
        await page.screenshot({ path: path.join(OUT_DIR, '03_kitchen.png') });
        console.log('✓ Kitchen captured');

        // 6. Menu Management
        await page.goto(`${BASE_URL}/menu`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '06_menu_management.png') });
        console.log('✓ Menu Management captured');

        // 7. Inventory Management
        await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '07_inventory_management.png') });
        console.log('✓ Inventory Management captured');

        // 8. Staff Management
        await page.goto(`${BASE_URL}/employees`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '08_staff_management.png') });
        console.log('✓ Staff Management captured');

        // 9. Finance (Order Management)
        await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '09_finance.png') });
        console.log('✓ Finance/Order Mgmt captured');

        // 10. Blog
        await page.goto(`${BASE_URL}/posts`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '10_posts.png') });
        console.log('✓ Blog/Posts captured');

        // 11. Settings
        await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
        await wait(3000);
        await page.screenshot({ path: path.join(OUT_DIR, '11_settings.png') });
        console.log('✓ Settings captured');

    } catch (e) {
        console.error('Error capturing screenshots:', e);
    } finally {
        await browser.close();
    }
})();
