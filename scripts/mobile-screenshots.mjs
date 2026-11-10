/**
 * mobile-screenshots.mjs
 * Captures required screenshots for PR evidence:
 *   - 390 dark + light (homepage, /docs, /verify, /app)
 *   - 1440 dark + light (homepage)
 * Checks for horizontal overflow at 390 on each page.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT, 'frontend', 'dist');
const OUT_DIR = path.resolve(ROOT, 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

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

const PORT = 3463;

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('zinipay_theme', t);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(t);
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  await page.waitForTimeout(500);
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  if (overflow) {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.warn(`  ⚠️  OVERFLOW on ${label}: scrollWidth=${scrollWidth} innerWidth=${innerWidth}`);
  } else {
    console.log(`  ✓ No overflow on ${label}`);
  }
  return overflow;
}

server.listen(PORT, async () => {
  console.log(`\nServer on http://localhost:${PORT}\n`);

  let overflowFound = false;

  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    // ─── 390px shots ─────────────────────────────────────────────────────────
    const pages390 = [
      { route: '/',       slug: 'home'   },
      { route: '/docs',   slug: 'docs'   },
      { route: '/verify', slug: 'verify' },
      { route: '/app',    slug: 'app'    },
    ];

    for (const { route, slug } of pages390) {
      for (const theme of ['dark', 'light']) {
        const ctx = await browser.newContext({
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 2,
          isMobile: true,
        });
        const pg = await ctx.newPage();
        await pg.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle' });
        await setTheme(pg, theme);

        const hasOverflow = await checkOverflow(pg, `${slug} 390 ${theme}`);
        if (hasOverflow) overflowFound = true;

        const filename = `${slug}-${theme}-390.png`;
        await pg.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
        console.log(`  📸 ${filename}`);
        await ctx.close();
      }
    }

    // ─── 1440px shots (homepage only) ────────────────────────────────────────
    for (const theme of ['dark', 'light']) {
      const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      });
      const pg = await ctx.newPage();
      await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await setTheme(pg, theme);

      const filename = `home-${theme}-1440.png`;
      await pg.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
      console.log(`  📸 ${filename}`);
      await ctx.close();
    }

    await browser.close();

    console.log('\n─────────────────────────────────────────');
    if (overflowFound) {
      console.log('⚠️  Horizontal overflow detected on one or more pages at 390px.');
    } else {
      console.log('✅ No horizontal overflow at 390px on any page.');
    }
    console.log(`📁 Screenshots saved to: ${OUT_DIR}`);
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    server.close();
  }
});
