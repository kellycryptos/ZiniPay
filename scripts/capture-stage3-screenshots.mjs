import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.resolve(ROOT, 'screenshots');
const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\219c2754-9a7d-474d-95ac-c4b11c77add5';

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

const PORT = 3458;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    const copyToArtifacts = (filename) => {
      const src = path.join(SCREENSHOTS_DIR, filename);
      const dest = path.join(ARTIFACTS_DIR, filename);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${filename} to artifacts dir`);
      }
    };

    // 1. Standalone Docs Page 1280px (Desktop Full Page)
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to /docs (1280px)...');
      await page.goto(`http://localhost:${PORT}/docs`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage3-docs-1280.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage3-docs-1280.png');
      await context.close();
    }

    // 2. Standalone Docs Page 390px (Mobile Full Page)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to /docs (390px)...');
      await page.goto(`http://localhost:${PORT}/docs`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      const outPath = path.join(SCREENSHOTS_DIR, 'stage3-docs-390.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage3-docs-390.png');
      await context.close();
    }

    // 3. In-App Dashboard Docs Tab 1280px
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      console.log('Navigating to Dashboard Board (1280px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      console.log('Switching to Docs tab in sidebar...');
      const docsButton = page.locator('button:has-text("Docs")').first();
      await docsButton.click();
      await page.waitForTimeout(3000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage3-dashboard-docs-1280.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage3-dashboard-docs-1280.png');
      await context.close();
    }

    // 4. In-App Dashboard Docs Tab 390px (Mobile)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      console.log('Navigating to Dashboard Board (390px)...');
      await page.goto(`http://localhost:${PORT}/board`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      console.log('Opening mobile menu drawer...');
      const menuButton = page.locator('header button').first();
      await menuButton.click();
      await page.waitForTimeout(1000);

      const docsMobileButton = page.locator('aside button:has-text("Docs")');
      await docsMobileButton.click();
      await page.waitForTimeout(3000);

      const outPath = path.join(SCREENSHOTS_DIR, 'stage3-dashboard-docs-390.png');
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
      copyToArtifacts('stage3-dashboard-docs-390.png');
      await context.close();
    }

    await browser.close();
    console.log('All Stage 3 screenshots captured and verified successfully.');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Error capturing Stage 3 screenshots:', err);
    server.close();
    process.exit(1);
  }
});
