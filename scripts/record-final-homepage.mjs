import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT, 'frontend', 'dist');
const VIDEO_DIR = path.resolve(ROOT, 'docs', 'videos');
const SCREENSHOT_DIR = path.resolve(ROOT, 'docs', 'screenshots');
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\5d2546d3-57d5-43d1-a1f4-1c5a07729f51';

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
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
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not Found');
  }
});

const PORT = 3589;

async function run() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server listening on port ${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // 1. High-res screenshots first
  const shotContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const shotPage = await shotContext.newPage();
  await shotPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

  // Dark full-page & viewport
  await shotPage.evaluate(() => {
    localStorage.setItem('zinipay_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await shotPage.waitForTimeout(500);

  const darkFull = path.join(SCREENSHOT_DIR, 'homepage-final-1440-full-dark.png');
  const darkView = path.join(SCREENSHOT_DIR, 'homepage-final-1440-dark.png');
  await shotPage.screenshot({ path: darkFull, fullPage: true });
  await shotPage.screenshot({ path: darkView, fullPage: false });

  fs.copyFileSync(darkFull, path.join(ARTIFACT_DIR, 'homepage-final-1440-full-dark.png'));
  fs.copyFileSync(darkView, path.join(ARTIFACT_DIR, 'homepage-final-1440-dark.png'));
  console.log('Saved dark screenshots');

  // Light full-page & viewport
  await shotPage.evaluate(() => {
    localStorage.setItem('zinipay_theme', 'light');
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await shotPage.waitForTimeout(500);

  const lightFull = path.join(SCREENSHOT_DIR, 'homepage-final-1440-full-light.png');
  const lightView = path.join(SCREENSHOT_DIR, 'homepage-final-1440-light.png');
  await shotPage.screenshot({ path: lightFull, fullPage: true });
  await shotPage.screenshot({ path: lightView, fullPage: false });

  fs.copyFileSync(lightFull, path.join(ARTIFACT_DIR, 'homepage-final-1440-full-light.png'));
  fs.copyFileSync(lightView, path.join(ARTIFACT_DIR, 'homepage-final-1440-light.png'));
  console.log('Saved light screenshots');

  await shotContext.close();

  // 2. Video recording
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await videoContext.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

  // Ensure dark mode initial
  await page.evaluate(() => {
    localStorage.setItem('zinipay_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(1000);

  // Smooth scroll down
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 250;
  for (let pos = 0; pos <= totalHeight; pos += step) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), pos);
    await page.waitForTimeout(400);
  }

  await page.waitForTimeout(1000);

  // Toggle theme to light
  await page.click('[aria-label="Toggle theme"], button:has-text("Theme"), button:has-text("Mode")').catch(() => {});
  await page.evaluate(() => {
    const isLight = document.documentElement.classList.contains('light');
    if (!isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });
  await page.waitForTimeout(1000);

  // Smooth scroll back up
  for (let pos = totalHeight; pos >= 0; pos -= step) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), pos);
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(1500);

  // Close context to finalize video
  await page.close();
  await videoContext.close();
  await browser.close();
  server.close();

  // Rename recorded video to a clean name
  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    // Sort by mtime descending
    files.sort((a, b) => fs.statSync(path.join(VIDEO_DIR, b)).mtimeMs - fs.statSync(path.join(VIDEO_DIR, a)).mtimeMs);
    const latest = files[0];
    const finalVideoPath = path.join(VIDEO_DIR, 'homepage-final-walkthrough.webm');
    fs.copyFileSync(path.join(VIDEO_DIR, latest), finalVideoPath);
    fs.copyFileSync(finalVideoPath, path.join(ARTIFACT_DIR, 'homepage-final-walkthrough.webm'));
    console.log(`Video recorded successfully: ${finalVideoPath}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
