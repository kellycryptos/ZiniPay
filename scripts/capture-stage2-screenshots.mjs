import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(ROOT, 'screenshots');
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\c6b91e3d-d728-476c-8c79-19aaca662416';

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

const PORT = 3459;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    // Helper to copy to artifacts dir
    const copyToArtifacts = (filename) => {
      const src = path.join(SCREENSHOTS_DIR, filename);
      const dest = path.join(ARTIFACTS_DIR, filename);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${filename} to artifacts dir`);
      }
    };

    // 1. Homepage 1280px (Desktop Full Page)
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to Homepage (1280px)...');
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage2-homepage-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage2-homepage-1280.png');
      await context.close();
    }

    // 2. Homepage 390px (Mobile Full Page)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to Homepage (390px)...');
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage2-homepage-390.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage2-homepage-390.png');
      await context.close();
    }

    // 3. Dashboard Contributors View 1280px
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to Dashboard Board (1280px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Click Contributors tab in sidebar
      console.log('Switching to Contributors tab...');
      const contribButton = page.locator('button:has-text("Contributors")').first();
      await contribButton.click();
      await page.waitForTimeout(3000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage2-dashboard-contributors-1280.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage2-dashboard-contributors-1280.png');
      await context.close();
    }

    // 4. Dashboard Contributors View 390px (Mobile)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to Dashboard Board (390px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Open mobile menu drawer and click Contributors
      console.log('Opening mobile menu drawer...');
      const menuButton = page.locator('header button').first();
      await menuButton.click();
      await page.waitForTimeout(1000);

      const contribMobileButton = page.locator('button:has-text("Contributors")').last();
      await contribMobileButton.click();
      await page.waitForTimeout(3000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage2-dashboard-contributors-390.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage2-dashboard-contributors-390.png');
      await context.close();
    }

    await browser.close();
    console.log('All Stage 2 screenshots captured and verified successfully.');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Error capturing screenshots:', err);
    server.close();
    process.exit(1);
  }
});
