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

const PORT = 3462;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    const copyToArtifacts = (filename) => {
      if (fs.existsSync(ARTIFACTS_DIR)) {
        const src = path.join(SCREENSHOTS_DIR, filename);
        const dst = path.join(ARTIFACTS_DIR, filename);
        fs.copyFileSync(src, dst);
        console.log(`Copied to artifact: ${dst}`);
      }
    };

    // 1. Homepage Light Mode at 1280px
    {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      // Ensure theme is light
      await page.evaluate(() => {
        localStorage.setItem('zinipay_theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      });
      await page.waitForTimeout(600);
      const outPath = path.join(SCREENSHOTS_DIR, 'homepage-light-1280.png');
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: ${outPath}`);
      copyToArtifacts('homepage-light-1280.png');
      await context.close();
    }

    // 2. Homepage Light Mode at 390px
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        localStorage.setItem('zinipay_theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      });
      await page.waitForTimeout(600);
      const outPath = path.join(SCREENSHOTS_DIR, 'homepage-light-390.png');
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: ${outPath}`);
      copyToArtifacts('homepage-light-390.png');
      await context.close();
    }

    // 3. Homepage Dark Mode at 1280px
    {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        localStorage.setItem('zinipay_theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.waitForTimeout(600);
      const outPath = path.join(SCREENSHOTS_DIR, 'homepage-dark-1280.png');
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: ${outPath}`);
      copyToArtifacts('homepage-dark-1280.png');
      await context.close();
    }

    // 4. Homepage Dark Mode at 390px
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        localStorage.setItem('zinipay_theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.waitForTimeout(600);
      const outPath = path.join(SCREENSHOTS_DIR, 'homepage-dark-390.png');
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Captured: ${outPath}`);
      copyToArtifacts('homepage-dark-390.png');
      await context.close();
    }

    await browser.close();
    console.log('All screenshots captured successfully.');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    server.close();
  }
});
