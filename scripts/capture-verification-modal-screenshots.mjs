import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(ROOT, 'screenshots');
const DIST_DIR = path.resolve(ROOT, 'frontend', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3457;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    // 1. Live Verification Modal (Normal RPC)
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to /board for Live Modal...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Click "Verify on-chain"
      console.log('Clicking "Verify on-chain"...');
      await page.click('button:has-text("Verify on-chain")');
      // Wait for queries to run
      await page.waitForTimeout(4000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-verification-modal-live.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 2. Blocked RPC Verification Modal
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();

      // Block all NEAR RPC calls
      console.log('Intercepting and aborting RPC endpoints...');
      await page.route('**/*fastnear*/**', (route) => route.abort());
      await page.route('**/*near.org*/**', (route) => route.abort());

      console.log('Navigating to /board for Blocked RPC Modal...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Click "Verify on-chain"
      console.log('Clicking "Verify on-chain" with blocked RPC...');
      await page.click('button:has-text("Verify on-chain")');
      await page.waitForTimeout(3000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-verification-modal-blocked.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 3. Refresh Board Live 1280px, 390px, and RPC Down
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Refreshing /board 1280px live...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-1280-live.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Refreshing /board 390px live...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-390-live.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.route('**/*fastnear*/**', (route) => route.abort());
      await page.route('**/*near.org*/**', (route) => route.abort());
      console.log('Refreshing /board 1280px RPC Down...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-1280-rpcdown.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    await browser.close();
    console.log('All modal and board screenshots captured successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error capturing modal screenshots:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
