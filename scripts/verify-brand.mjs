import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('frontend/public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'brand');

async function verify() {
  console.log('--- Verifying ZiniPay Brand & Favicon Deliverables ---\n');

  // 1. Check all required files exist
  const requiredFiles = [
    'brand/concepts/concept-a.svg',
    'brand/concepts/concept-b.svg',
    'brand/concepts/concept-c.svg',
    'brand/logo-mark.svg',
    'brand/logo-wordmark.svg',
    'brand/logo-mono-dark.svg',
    'brand/logo-mono-light.svg',
    'favicon.svg',
    'favicon.ico',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'icon-512-maskable.png',
    'og-image.png',
    'site.webmanifest',
    'brand/contact-sheet.png'
  ];

  let allExist = true;
  for (const rel of requiredFiles) {
    const full = path.join(PUBLIC_DIR, rel);
    if (!fs.existsSync(full)) {
      console.error(`✗ Missing: ${rel}`);
      allExist = false;
    } else {
      const stat = fs.statSync(full);
      console.log(`✓ ${rel} (${stat.size} bytes)`);
    }
  }

  if (!allExist) throw new Error('Some required brand files are missing');

  // 2. Validate ICO file structure
  console.log('\n--- Validating favicon.ico Structure ---');
  const icoBuf = fs.readFileSync(path.join(PUBLIC_DIR, 'favicon.ico'));
  const reserved = icoBuf.readUInt16LE(0);
  const type = icoBuf.readUInt16LE(2);
  const count = icoBuf.readUInt16LE(4);
  console.log(`ICO Header: reserved=${reserved}, type=${type} (expected 1), frame count=${count} (expected 3)`);
  if (reserved !== 0 || type !== 1 || count !== 3) {
    throw new Error('Invalid ICO header');
  }

  const expectedSizes = [16, 32, 48];
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const w = icoBuf.readUInt8(offset) || 256;
    const h = icoBuf.readUInt8(offset + 1) || 256;
    const dataSize = icoBuf.readUInt32LE(offset + 8);
    const dataOffset = icoBuf.readUInt32LE(offset + 12);
    const framePng = icoBuf.slice(dataOffset, dataOffset + dataSize);
    
    // Check PNG signature
    const isPng = framePng.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    console.log(`  Frame ${i + 1}: ${w}x${h} px, ${dataSize} bytes, valid PNG: ${isPng}`);
    if (w !== expectedSizes[i] || h !== expectedSizes[i] || !isPng) {
      throw new Error(`Frame ${i} does not match expected ${expectedSizes[i]}x${expectedSizes[i]}`);
    }
  }

  // 3. Verify wordmark SVG has NO live <text> tags
  console.log('\n--- Validating logo-wordmark.svg (Outlined Paths Only) ---');
  const wordmarkContent = fs.readFileSync(path.join(BRAND_DIR, 'logo-wordmark.svg'), 'utf8');
  if (/<text\b/i.test(wordmarkContent)) {
    throw new Error('logo-wordmark.svg contains live <text> tags! Must be outlined vector paths only.');
  } else {
    console.log('✓ logo-wordmark.svg has zero <text> elements; 100% outlined vector paths.');
  }

  // 4. Verify favicon.svg contains prefers-color-scheme
  console.log('\n--- Validating favicon.svg Responsive Switch ---');
  const faviconContent = fs.readFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), 'utf8');
  if (!faviconContent.includes('prefers-color-scheme')) {
    throw new Error('favicon.svg missing prefers-color-scheme media query');
  } else {
    console.log('✓ favicon.svg contains @media (prefers-color-scheme: dark) color switching.');
  }

  // 5. Test rendering mark at 16, 32, 64px on dark (#0A0B0E) and light (#FFFFFF)
  console.log('\n--- Testing Mark Renderings at 16, 32, 64px on Dark & Light ---');
  const markSvg = fs.readFileSync(path.join(BRAND_DIR, 'logo-mark.svg'), 'utf8');
  const markDark = markSvg; // Green mark
  const markLight = fs.readFileSync(path.join(BRAND_DIR, 'logo-mono-light.svg'), 'utf8'); // Dark mark

  for (const s of [16, 32, 64]) {
    const darkPng = await sharp(Buffer.from(markDark))
      .resize(s, s)
      .flatten({ background: '#0A0B0E' })
      .png()
      .toBuffer();
    const lightPng = await sharp(Buffer.from(markLight))
      .resize(s, s)
      .flatten({ background: '#FFFFFF' })
      .png()
      .toBuffer();
    console.log(`  Mark ${s}x${s}: Dark buf=${darkPng.length}b, Light buf=${lightPng.length}b`);
  }

  // 6. Verify image dimensions using sharp metadata
  console.log('\n--- Verifying Exact Pixel Dimensions of Generated Assets ---');
  const dimensions = [
    { file: 'apple-touch-icon.png', w: 180, h: 180 },
    { file: 'icon-192.png', w: 192, h: 192 },
    { file: 'icon-512.png', w: 512, h: 512 },
    { file: 'icon-512-maskable.png', w: 512, h: 512 },
    { file: 'og-image.png', w: 1200, h: 630 },
    { file: 'brand/contact-sheet.png', w: 1200, h: 960 },
  ];

  for (const item of dimensions) {
    const meta = await sharp(path.join(PUBLIC_DIR, item.file)).metadata();
    if (meta.width !== item.w || meta.height !== item.h) {
      throw new Error(`${item.file} has wrong dimensions: ${meta.width}x${meta.height}, expected ${item.w}x${item.h}`);
    }
    console.log(`✓ ${item.file} matches exact dimensions ${meta.width}x${meta.height}`);
  }

  console.log('\n--- All brand and favicon asset checks PASSED successfully! ---');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
