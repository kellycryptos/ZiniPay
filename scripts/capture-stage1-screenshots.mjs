import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(ROOT, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Simple static server for frontend/dist
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

const PORT = 3456;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    // 1. Live View 1280px
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to /board (Live 1280px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-1280-live.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 2. Live View 390px (Mobile)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to /board (Live 390px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-390-live.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 3. Demo Simulation 1280px
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to /board?demo=1 (Demo 1280px)...');
      await page.goto(`http://localhost:${PORT}/board?demo=1`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-1280-demo.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 4. Demo Simulation 390px (Mobile)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to /board?demo=1 (Demo 390px)...');
      await page.goto(`http://localhost:${PORT}/board?demo=1`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-390-demo.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 5. RPC Down 1280px (Aborting all NEAR RPC calls)
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.route('**/*fastnear*/**', (route) => route.abort());
      await page.route('**/*near.org*/**', (route) => route.abort());
      console.log('Navigating to /board with RPC aborted (RPC Down 1280px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-1280-rpcdown.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    // 6. RPC Down 390px (Mobile)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.route('**/*fastnear*/**', (route) => route.abort());
      await page.route('**/*near.org*/**', (route) => route.abort());
      console.log('Navigating to /board with RPC aborted (RPC Down 390px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage1-dashboard-390-rpcdown.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      await context.close();
    }

    await browser.close();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
