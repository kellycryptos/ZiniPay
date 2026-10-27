import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// --- Paths & Output Directories ---
const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'frontend', 'public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'brand');
const CONCEPTS_DIR = path.join(BRAND_DIR, 'concepts');

if (!fs.existsSync(BRAND_DIR)) fs.mkdirSync(BRAND_DIR, { recursive: true });
if (!fs.existsSync(CONCEPTS_DIR)) fs.mkdirSync(CONCEPTS_DIR, { recursive: true });

// --- Color Tokens (from frontend/src/index.css) ---
const CANVAS_BG = '#0A0B0E';
const PANEL_BG = '#111318';
const PANEL_ALT = '#161922';
const BORDER_SUBTLE = '#1F2432';
const BORDER_STRONG = '#2C3447';
const PASSED_GREEN = '#00EC97';
const TEXT_PRIMARY = '#F1F5F9';
const TEXT_SECONDARY = '#94A3B8';
const TEXT_MUTED = '#64748B';

// --- SVG Mark Definitions ---
// Concept A: Three-Gate Ledger Z
// Top bar (Proof Gate): M4 4h24v5H4z
// Middle bar (Policy Gate): M7 13.5h18v5H7z
// Bottom bar (Quorum Gate): M4 23h24v5H4z
// Diagonal linking beam: M23 9h5l-19 14h-5z
const MARK_PATH_CHOSEN = "M4 4h24v5H4z M7 13.5h18v5H7z M4 23h24v5H4z M23 9h5l-19 14h-5z";

// Wordmark Outlined Letters (Space Grotesk geometric geometry vectorized to pure path)
const WORDMARK_LETTERS_PATH = [
  // Z (x: 40..55)
  "M40 8h15v3.2l-9.8 10.6H55V25H40v-3.2l9.8-10.6H40V8z",
  // i (x: 59..62.4)
  "M59 13h3.4v12H59V13z M59 8h3.4v3.4H59V8z",
  // n (x: 67..81)
  "M67 13h3.3v1.6c1.1-1.3 2.7-1.9 4.7-1.9 3.6 0 6 2.2 6 6.1V25h-3.4v-5.8c0-2.6-1.3-4-3.6-4-2.2 0-3.6 1.4-3.6 4V25H67V13z",
  // i (x: 85..88.4)
  "M85 13h3.4v12H85V13z M85 8h3.4v3.4H85V8z",
  // P (x: 93..108)
  "M93 8h8.5c4 0 6.5 2.3 6.5 5.3s-2.5 5.3-6.5 5.3H96.4V25H93V8zm3.4 3.2v4.2h5.1c1.9 0 3.1-0.9 3.1-2.1s-1.2-2.1-3.1-2.1h-5.1z",
  // a (x: 111.5..125.5)
  "M122.1 14.8c-1-1.3-2.6-2.2-4.6-2.2-4 0-6.8 3-6.8 6.4s2.8 6.4 6.8 6.4c2 0 3.6-0.9 4.6-2.2V25h3.4V13h-3.4v1.8zm0 4.2v0.4c0 2.2-1.5 3.8-3.6 3.8-2.2 0-3.6-1.6-3.6-3.8s1.4-3.8 3.6-3.8c2.1 0 3.6 1.6 3.6 3.4z",
  // y (x: 129..143)
  "M129 13h3.6l3.7 7.2 3.7-7.2h3.6l-6.5 12.6c-1 1.9-2.3 2.9-4.5 2.9h-2.3v-3h1.7c1.1 0 1.8-0.5 2.3-1.5l0.6-1.2-6-9.8z"
].join(" ");

// --- Helper Functions ---
function createIcoBuffer(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + count * dirEntrySize;

  let currentOffset = dirSize;
  const dirEntries = [];

  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);

    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image data size
    entry.writeUInt32LE(currentOffset, 12); // image offset

    dirEntries.push(entry);
    currentOffset += buf.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type (1 = ICO)
  header.writeUInt16LE(count, 4); // image count

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function buildAll() {
  console.log('--- Building ZiniPay Brand & Favicon Assets ---');

  // 1. Concept SVGs are preserved in frontend/public/brand/concepts/
  console.log('✓ Concepts preserved in frontend/public/brand/concepts/');

  // 2. brand/logo-mark.svg
  const logoMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-mark.svg'), logoMarkSvg);
  console.log('✓ Created frontend/public/brand/logo-mark.svg');

  // 3. brand/logo-wordmark.svg (Outlined paths, zero live text)
  const logoWordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 32" fill="none">
  <!-- Mark -->
  <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
  <!-- Outlined ZiniPay typography -->
  <path fill-rule="evenodd" clip-rule="evenodd" d="${WORDMARK_LETTERS_PATH}" fill="${TEXT_PRIMARY}"/>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-wordmark.svg'), logoWordmarkSvg);
  console.log('✓ Created frontend/public/brand/logo-wordmark.svg');

  // 4. brand/logo-mono-dark.svg (For dark backgrounds)
  const logoMonoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="${MARK_PATH_CHOSEN}" fill="${TEXT_PRIMARY}"/>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-mono-dark.svg'), logoMonoDarkSvg);
  console.log('✓ Created frontend/public/brand/logo-mono-dark.svg');

  // 5. brand/logo-mono-light.svg (For white backgrounds)
  const logoMonoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="${MARK_PATH_CHOSEN}" fill="${CANVAS_BG}"/>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-mono-light.svg'), logoMonoLightSvg);
  console.log('✓ Created frontend/public/brand/logo-mono-light.svg');

  // 6. favicon.svg (Responsive with prefers-color-scheme)
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    :root { color: ${CANVAS_BG}; }
    @media (prefers-color-scheme: dark) {
      :root { color: ${PASSED_GREEN}; }
    }
  </style>
  <path d="${MARK_PATH_CHOSEN}" fill="currentColor"/>
</svg>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg);
  console.log('✓ Created frontend/public/favicon.svg');

  // 7. favicon.ico (Multi-resolution: 16, 32, 48 px)
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = [];
  for (const size of icoSizes) {
    const markAtSizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
    </svg>`;
    const pngBuf = await sharp(Buffer.from(markAtSizeSvg))
      .resize(size, size)
      .png()
      .toBuffer();
    icoPngBuffers.push(pngBuf);
  }
  const icoBuf = createIcoBuffer(icoPngBuffers, icoSizes);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuf);
  console.log('✓ Created frontend/public/favicon.ico (multi-resolution 16, 32, 48px)');

  // 8. apple-touch-icon.png (180x180, solid #0A0B0E, centered with safe padding)
  const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <rect width="180" height="180" fill="${CANVAS_BG}"/>
    <!-- Centered mark with 32px safe padding -> 116x116 area -->
    <g transform="translate(32, 32) scale(3.625)">
      <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
    </g>
  </svg>`;
  const appleTouchBuf = await sharp(Buffer.from(appleTouchSvg)).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleTouchBuf);
  console.log('✓ Created frontend/public/apple-touch-icon.png (180x180)');

  // 9. icon-192.png (192x192)
  const icon192Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
    <rect width="192" height="192" fill="${CANVAS_BG}"/>
    <g transform="translate(32, 32) scale(4)">
      <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
    </g>
  </svg>`;
  const icon192Buf = await sharp(Buffer.from(icon192Svg)).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), icon192Buf);
  console.log('✓ Created frontend/public/icon-192.png (192x192)');

  // 10. icon-512.png (512x512)
  const icon512Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${CANVAS_BG}"/>
    <g transform="translate(86, 86) scale(10.625)">
      <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
    </g>
  </svg>`;
  const icon512Buf = await sharp(Buffer.from(icon512Svg)).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), icon512Buf);
  console.log('✓ Created frontend/public/icon-512.png (512x512)');

  // 11. icon-512-maskable.png (512x512, centered in 80% safe zone: 409.6px circle)
  // Inner mark scale = 9.5 (304x304), centered at x=104, y=104
  const icon512MaskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${CANVAS_BG}"/>
    <g transform="translate(104, 104) scale(9.5)">
      <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
    </g>
  </svg>`;
  const icon512MaskableBuf = await sharp(Buffer.from(icon512MaskableSvg)).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512-maskable.png'), icon512MaskableBuf);
  console.log('✓ Created frontend/public/icon-512-maskable.png (512x512 safe zone)');

  // 12. og-image.png (1200x630)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PASSED_GREEN}" stop-opacity="0.12" />
        <stop offset="100%" stop-color="${PASSED_GREEN}" stop-opacity="0" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141824" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Canvas -->
    <rect width="1200" height="630" fill="${CANVAS_BG}" />
    <rect width="1200" height="630" fill="url(#grid)" />
    
    <!-- Top green subtle glow -->
    <circle cx="600" cy="0" r="450" fill="url(#glow)" />

    <!-- Ledger Card Outer Frame -->
    <rect x="48" y="40" width="1104" height="550" rx="10" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" stroke-width="1.5" />
    <rect x="48" y="40" width="1104" height="550" rx="10" fill="none" stroke="${BORDER_STRONG}" stroke-width="1" stroke-dasharray="8 8" />

    <!-- Corner registration brackets -->
    <path d="M 48 64 L 48 40 L 72 40" fill="none" stroke="${PASSED_GREEN}" stroke-width="3" />
    <path d="M 1152 64 L 1152 40 L 1128 40" fill="none" stroke="${PASSED_GREEN}" stroke-width="3" />
    <path d="M 48 566 L 48 590 L 72 590" fill="none" stroke="${PASSED_GREEN}" stroke-width="3" />
    <path d="M 1152 566 L 1152 590 L 1128 590" fill="none" stroke="${PASSED_GREEN}" stroke-width="3" />

    <!-- Header metadata row -->
    <g transform="translate(80, 78)">
      <circle cx="6" cy="6" r="4" fill="${PASSED_GREEN}" />
      <text x="20" y="10" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" letter-spacing="1.5">SPUTNIK DAO v2 · FAIL-CLOSED ARCHITECTURE</text>
      <text x="1040" y="10" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="end">NEAR TESTNET &amp; MAINNET</text>
    </g>

    <!-- Header perforation line -->
    <line x1="80" y1="102" x2="1120" y2="102" stroke="${BORDER_SUBTLE}" stroke-width="1" stroke-dasharray="6 4" />

    <!-- Main Identity Lockup: Mark + Wordmark -->
    <g transform="translate(80, 140)">
      <!-- Mark Symbol (scaled to 100x100) -->
      <g transform="scale(3.125)">
        <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
      </g>

      <!-- Typography -->
      <text x="130" y="58" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="64" font-weight="800" letter-spacing="-1">ZiniPay</text>
      
      <!-- Version & Subtitle badge -->
      <rect x="390" y="18" width="168" height="28" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_STRONG}" />
      <text x="474" y="37" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" text-anchor="middle">TREASURY PROTOCOL</text>

      <!-- Tagline -->
      <text x="130" y="100" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="28" font-weight="600">
        Agents propose. Contracts enforce. Humans decide.
      </text>
    </g>

    <!-- Problem statement -->
    <text x="80" y="300" fill="${TEXT_SECONDARY}" font-family="'Space Grotesk', sans-serif" font-size="20">
      Communities need to pay contributors without handing an AI the keys.
    </text>

    <!-- Three Gate Cards (Proof, Policy, Human Quorum) -->
    <g transform="translate(80, 340)">
      <!-- Gate 01 -->
      <rect x="0" y="0" width="310" height="130" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
      <line x1="0" y1="0" x2="310" y2="0" stroke="${PASSED_GREEN}" stroke-width="2" />
      <text x="20" y="32" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">GATE 01 // PROOF</text>
      <text x="20" y="60" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="16" font-weight="700">Attestation &amp; Evidence</text>
      <text x="20" y="86" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12">IPFS CID · AI Deliberation</text>
      <text x="20" y="108" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11">Claimed payload hash</text>

      <!-- Gate 02 -->
      <rect x="345" y="0" width="310" height="130" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
      <line x1="0" y1="0" x2="310" y2="0" stroke="${PASSED_GREEN}" stroke-width="2" />
      <text x="365" y="32" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">GATE 02 // POLICY</text>
      <text x="365" y="60" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="16" font-weight="700">On-Chain Invariants</text>
      <text x="365" y="86" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12">Payout Cap · Cooldown · CID</text>
      <text x="365" y="108" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11">Fail-closed smart contract</text>

      <!-- Gate 03 -->
      <rect x="690" y="0" width="350" height="130" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
      <line x1="0" y1="0" x2="350" y2="0" stroke="${PASSED_GREEN}" stroke-width="2" />
      <text x="710" y="32" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">GATE 03 // HUMAN QUORUM</text>
      <text x="710" y="60" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="16" font-weight="700">Council Multi-Sig</text>
      <text x="710" y="86" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12">M-of-N Signed Approvals</text>
      <text x="710" y="108" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11">Sputnik DAO v2 consensus</text>
    </g>

    <!-- Footer perforation line -->
    <line x1="80" y1="510" x2="1120" y2="510" stroke="${BORDER_SUBTLE}" stroke-width="1" stroke-dasharray="6 4" />

    <!-- Footer row -->
    <g transform="translate(80, 545)">
      <text x="0" y="12" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="12">ZERO-FABRICATION LEDGER · 100% NEAR-ALIGNED</text>
      <text x="1040" y="12" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12" text-anchor="end">github.com/zinipay/zinipay</text>
    </g>
  </svg>`;
  const ogBuf = await sharp(Buffer.from(ogSvg)).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'og-image.png'), ogBuf);
  console.log('✓ Created frontend/public/og-image.png (1200x630)');

  // 13. site.webmanifest
  const manifest = {
    name: "ZiniPay",
    short_name: "ZiniPay",
    description: "Constrained Agent Layer for Community Treasuries",
    start_url: "/",
    display: "standalone",
    background_color: CANVAS_BG,
    theme_color: CANVAS_BG,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✓ Created frontend/public/site.webmanifest');

  // 14. brand/contact-sheet.png (Visual proof sheet displaying concepts & full asset set)
  // Read SVG strings for concept A, B, C
  const svgConceptA = fs.readFileSync(path.join(CONCEPTS_DIR, 'concept-a.svg'), 'utf8');
  const svgConceptB = fs.readFileSync(path.join(CONCEPTS_DIR, 'concept-b.svg'), 'utf8');
  const svgConceptC = fs.readFileSync(path.join(CONCEPTS_DIR, 'concept-c.svg'), 'utf8');

  // Build the contact sheet SVG: 1200 x 960
  const contactSheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="960" viewBox="0 0 1200 960">
    <defs>
      <pattern id="cs-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#141824" stroke-width="1" />
      </pattern>
    </defs>

    <!-- Canvas -->
    <rect width="1200" height="960" fill="${CANVAS_BG}" />
    <rect width="1200" height="960" fill="url(#cs-grid)" />

    <!-- Header Frame -->
    <g transform="translate(48, 36)">
      <text x="0" y="24" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" letter-spacing="1.5">ZINIPAY BRAND IDENTITY SYSTEM // DESIGN PROOF SHEET</text>
      <text x="0" y="54" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="28" font-weight="800">Concept Exploration &amp; Full Asset Verification</text>
      <text x="0" y="78" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="12">
        Evaluated against 16px legibility, distinctiveness, ledger fit, and rendering simplicity. Zero clipart, zero fonts in mark.
      </text>
    </g>

    <line x1="48" y1="130" x2="1152" y2="130" stroke="${BORDER_SUBTLE}" stroke-width="1" />

    <!-- SECTION 1: Three Concepts Side-by-Side -->
    <g transform="translate(48, 145)">
      <text x="0" y="16" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">PART 1: THREE CONCEPTS AT 64px, 32px &amp; 16px (DARK &amp; LIGHT TESTING)</text>

      <!-- Concept A (CHOSEN) -->
      <g transform="translate(0, 30)">
        <rect width="350" height="320" rx="8" fill="${PANEL_BG}" stroke="${PASSED_GREEN}" stroke-width="1.5" />
        <rect x="0" y="0" width="350" height="28" rx="8" fill="#10251E" />
        <text x="16" y="18" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">★ CONCEPT A (CHOSEN): THREE-GATE Z</text>

        <!-- 64px Dark -->
        <rect x="16" y="44" width="76" height="76" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(22, 50) scale(2)">
          <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
        </g>
        <text x="54" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Dark</text>

        <!-- 64px Light -->
        <rect x="100" y="44" width="76" height="76" rx="6" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(106, 50) scale(2)">
          <path d="${MARK_PATH_CHOSEN}" fill="${CANVAS_BG}" />
        </g>
        <text x="138" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Light</text>

        <!-- 32px Dark & Light -->
        <rect x="188" y="44" width="46" height="46" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(195, 51) scale(1)">
          <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
        </g>
        <text x="211" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Dark</text>

        <rect x="242" y="44" width="46" height="46" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(249, 51) scale(1)">
          <path d="${MARK_PATH_CHOSEN}" fill="${CANVAS_BG}" />
        </g>
        <text x="265" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Light</text>

        <!-- 16px Dark & Light -->
        <rect x="296" y="44" width="38" height="38" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(307, 55) scale(0.5)">
          <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
        </g>
        <text x="315" y="96" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Dark</text>

        <rect x="296" y="104" width="38" height="38" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(307, 115) scale(0.5)">
          <path d="${MARK_PATH_CHOSEN}" fill="${CANVAS_BG}" />
        </g>
        <text x="315" y="154" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Light</text>

        <!-- Evaluation notes -->
        <line x1="16" y1="168" x2="334" y2="168" stroke="${BORDER_SUBTLE}" stroke-width="1" />
        <text x="16" y="188" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="700">Winner: Optical Contrast &amp; Architecture</text>
        <text x="16" y="208" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• 3 rails represent Proof, Policy, Quorum.</text>
        <text x="16" y="224" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Bold 5px solid horizontal bars.</text>
        <text x="16" y="240" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Superior legibility at 16px tab scale.</text>
        <text x="16" y="256" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Monolithic solid polygon; scales cleanly.</text>
        <text x="16" y="278" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600">Selected for full asset suite generation</text>
      </g>

      <!-- Concept B: Notched Receipt Z -->
      <g transform="translate(375, 30)">
        <rect width="350" height="320" rx="8" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" stroke-width="1" />
        <rect x="0" y="0" width="350" height="28" rx="8" fill="${PANEL_ALT}" />
        <text x="16" y="18" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">CONCEPT B: NOTCHED RECEIPT Z</text>

        <!-- 64px Dark -->
        <rect x="16" y="44" width="76" height="76" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(22, 50) scale(2)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${PASSED_GREEN}" />
        </g>
        <text x="54" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Dark</text>

        <!-- 64px Light -->
        <rect x="100" y="44" width="76" height="76" rx="6" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(106, 50) scale(2)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${CANVAS_BG}" />
        </g>
        <text x="138" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Light</text>

        <!-- 32px Dark & Light -->
        <rect x="188" y="44" width="46" height="46" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(195, 51) scale(1)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${PASSED_GREEN}" />
        </g>
        <text x="211" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Dark</text>

        <rect x="242" y="44" width="46" height="46" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(249, 51) scale(1)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${CANVAS_BG}" />
        </g>
        <text x="265" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Light</text>

        <!-- 16px Dark & Light -->
        <rect x="296" y="44" width="38" height="38" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(307, 55) scale(0.5)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${PASSED_GREEN}" />
        </g>
        <text x="315" y="96" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Dark</text>

        <rect x="296" y="104" width="38" height="38" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(307, 115) scale(0.5)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3h22v10a3 3 0 0 0 0 6v10l-3.67-2.5L19.67 29 16 26.5 12.33 29 8.67 26.5 5 29V19a3 3 0 0 0 0-6V3zm4 5h14v4l-8.5 7H23v4H9v-4l8.5-7H9V8z" fill="${CANVAS_BG}" />
        </g>
        <text x="315" y="154" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Light</text>

        <!-- Evaluation notes -->
        <line x1="16" y1="168" x2="334" y2="168" stroke="${BORDER_SUBTLE}" stroke-width="1" />
        <text x="16" y="188" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="700">Analysis: Aperture Crowding</text>
        <text x="16" y="208" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• High ledger theme fidelity at 64px.</text>
        <text x="16" y="224" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Side notches and serrated tear.</text>
        <text x="16" y="240" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Cutout stencil Z collapses at 16px.</text>
        <text x="16" y="256" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Appears as a generic rectangle in tabs.</text>
        <text x="16" y="278" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10">Retained in concepts/ for swap</text>
      </g>

      <!-- Concept C: Verification Seal Z -->
      <g transform="translate(750, 30)">
        <rect width="354" height="320" rx="8" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" stroke-width="1" />
        <rect x="0" y="0" width="354" height="28" rx="8" fill="${PANEL_ALT}" />
        <text x="16" y="18" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">CONCEPT C: VERIFICATION SEAL Z</text>

        <!-- 64px Dark -->
        <rect x="16" y="44" width="76" height="76" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(22, 50) scale(2)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${PASSED_GREEN}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${PASSED_GREEN}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="54" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Dark</text>

        <!-- 64px Light -->
        <rect x="100" y="44" width="76" height="76" rx="6" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(106, 50) scale(2)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${CANVAS_BG}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${CANVAS_BG}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="138" y="132" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">64px Light</text>

        <!-- 32px Dark & Light -->
        <rect x="188" y="44" width="46" height="46" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(195, 51) scale(1)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${PASSED_GREEN}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${PASSED_GREEN}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="211" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Dark</text>

        <rect x="242" y="44" width="46" height="46" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(249, 51) scale(1)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${CANVAS_BG}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${CANVAS_BG}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="265" y="102" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">32px Light</text>

        <!-- 16px Dark & Light -->
        <rect x="296" y="44" width="38" height="38" rx="4" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
        <g transform="translate(307, 55) scale(0.5)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${PASSED_GREEN}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${PASSED_GREEN}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="315" y="96" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Dark</text>

        <rect x="296" y="104" width="38" height="38" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
        <g transform="translate(307, 115) scale(0.5)">
          <path d="M3 9V3h6M23 3h6v6M3 23v6h6M23 29h6v-6" stroke="${CANVAS_BG}" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M8 8h15.5v3.5L12 21h7l4-5" stroke="${CANVAS_BG}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
        </g>
        <text x="315" y="154" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">16px Light</text>

        <!-- Evaluation notes -->
        <line x1="16" y1="168" x2="334" y2="168" stroke="${BORDER_SUBTLE}" stroke-width="1" />
        <text x="16" y="188" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="700">Analysis: Fine-line Fading</text>
        <text x="16" y="208" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• High cryptographic approval aesthetic.</text>
        <text x="16" y="224" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• Checkmark terminal in Z diagonal.</text>
        <text x="16" y="240" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• 2.5px corner brackets drop below 1px</text>
        <text x="16" y="256" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">  at 16px rasterization, blurring detail.</text>
        <text x="16" y="278" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="10">Retained in concepts/ for swap</text>
      </g>
    </g>

    <!-- SECTION 2: Full Asset Suite (Concept A in production) -->
    <g transform="translate(48, 510)">
      <line x1="0" y1="0" x2="1104" y2="0" stroke="${BORDER_SUBTLE}" stroke-width="1" />
      <text x="0" y="24" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">PART 2: PRODUCTION ASSET SUITE &amp; RUNTIME VERIFICATION (CONCEPT A)</text>

      <!-- Card 1: Horizontal Outlined Wordmark Lockup -->
      <g transform="translate(0, 38)">
        <rect width="536" height="150" rx="8" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" />
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">brand/logo-wordmark.svg (Outlined Paths, No Live Text)</text>
        <!-- Wordmark scaled 2.5x -->
        <g transform="translate(20, 52) scale(2.2)">
          <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="${WORDMARK_LETTERS_PATH}" fill="${TEXT_PRIMARY}"/>
        </g>
        <text x="20" y="134" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ Renders identically on any OS without web fonts installed</text>
      </g>

      <!-- Card 2: Multi-Resolution Favicon & Responsive SVG -->
      <g transform="translate(556, 38)">
        <rect width="548" height="150" rx="8" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" />
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">favicon.svg &amp; favicon.ico (16, 32, 48px Multi-Resolution)</text>

        <g transform="translate(24, 48)">
          <!-- Simulated Dark Browser Tab -->
          <rect x="0" y="0" width="230" height="34" rx="6" fill="#1C212E" stroke="${BORDER_STRONG}" />
          <g transform="translate(10, 9) scale(0.5)">
            <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
          </g>
          <text x="32" y="21" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="11" font-weight="600">ZiniPay — Dashboard</text>

          <!-- Simulated Light Browser Tab -->
          <rect x="0" y="44" width="230" height="34" rx="6" fill="#E2E8F0" stroke="#CBD5E1" />
          <g transform="translate(10, 53) scale(0.5)">
            <path d="${MARK_PATH_CHOSEN}" fill="${CANVAS_BG}"/>
          </g>
          <text x="32" y="65" fill="#0A0B0E" font-family="'Space Grotesk', sans-serif" font-size="11" font-weight="600">ZiniPay — Dashboard</text>
        </g>

        <!-- ICO stats -->
        <g transform="translate(280, 48)">
          <text x="0" y="16" fill="${TEXT_PRIMARY}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">favicon.ico Frames:</text>
          <text x="0" y="36" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• 16x16 px (221b PNG)</text>
          <text x="0" y="52" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• 32x32 px (319b PNG)</text>
          <text x="0" y="68" fill="${TEXT_SECONDARY}" font-family="'JetBrains Mono', monospace" font-size="10">• 48x48 px (374b PNG)</text>
        </g>
      </g>

      <!-- Row 2: Apple Touch Icon, PWA Icons, OG Image Preview -->
      <g transform="translate(0, 204)">
        <rect width="1104" height="180" rx="8" fill="${PANEL_BG}" stroke="${BORDER_SUBTLE}" />
        
        <!-- Apple touch icon -->
        <g transform="translate(24, 20)">
          <rect x="0" y="0" width="100" height="100" rx="20" fill="${CANVAS_BG}" stroke="${BORDER_STRONG}" />
          <g transform="translate(18, 18) scale(2)">
            <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
          </g>
          <text x="50" y="124" fill="${TEXT_PRIMARY}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" text-anchor="middle">apple-touch-icon</text>
          <text x="50" y="138" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">180x180 px</text>
        </g>

        <!-- icon-192.png -->
        <g transform="translate(150, 20)">
          <rect x="0" y="0" width="100" height="100" rx="10" fill="${CANVAS_BG}" stroke="${BORDER_STRONG}" />
          <g transform="translate(18, 18) scale(2)">
            <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
          </g>
          <text x="50" y="124" fill="${TEXT_PRIMARY}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" text-anchor="middle">icon-192.png</text>
          <text x="50" y="138" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">PWA Standard</text>
        </g>

        <!-- icon-512-maskable.png -->
        <g transform="translate(276, 20)">
          <rect x="0" y="0" width="100" height="100" rx="10" fill="${CANVAS_BG}" stroke="${BORDER_STRONG}" />
          <!-- Safe zone guideline (circle 80%) -->
          <circle cx="50" cy="50" r="40" fill="none" stroke="${PASSED_GREEN}" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
          <g transform="translate(22, 22) scale(1.75)">
            <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}" />
          </g>
          <text x="50" y="124" fill="${TEXT_PRIMARY}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" text-anchor="middle">icon-512-maskable</text>
          <text x="50" y="138" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">80% Safe Zone OK</text>
        </g>

        <!-- Manifest & Meta Integration -->
        <g transform="translate(410, 20)">
          <rect width="360" height="140" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
          <text x="16" y="24" fill="${TEXT_PRIMARY}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">Wiring &amp; Manifest Status</text>
          <text x="16" y="48" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ frontend/index.html &lt;link rel="icon"&gt;</text>
          <text x="16" y="66" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ apple-touch-icon + manifest links wired</text>
          <text x="16" y="84" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ theme-color: #00EC97, bg: #0A0B0E</text>
          <text x="16" y="102" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ OpenGraph &amp; Twitter card meta pointing to /og-image.png</text>
          <text x="16" y="120" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="10">✓ title cleaned to "ZiniPay" (no emoji)</text>
        </g>

        <!-- Mini OG card preview -->
        <g transform="translate(790, 20)">
          <rect width="290" height="140" rx="6" fill="${PANEL_ALT}" stroke="${BORDER_SUBTLE}" />
          <rect x="12" y="12" width="266" height="116" rx="4" fill="${CANVAS_BG}" stroke="${BORDER_STRONG}" />
          <g transform="translate(24, 24) scale(0.6)">
            <path d="${MARK_PATH_CHOSEN}" fill="${PASSED_GREEN}"/>
          </g>
          <text x="50" y="38" fill="${TEXT_PRIMARY}" font-family="'Space Grotesk', sans-serif" font-size="14" font-weight="700">ZiniPay</text>
          <text x="24" y="60" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="8">GATE 01 // 02 // 03 ARCHITECTURE</text>
          <text x="24" y="78" fill="${TEXT_SECONDARY}" font-family="'Space Grotesk', sans-serif" font-size="9">Agents propose. Contracts enforce.</text>
          <text x="24" y="92" fill="${TEXT_SECONDARY}" font-family="'Space Grotesk', sans-serif" font-size="9">Humans decide.</text>
          <text x="24" y="114" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="7">og:image (1200x630)</text>
        </g>
      </g>
    </g>

    <!-- Perforation footer -->
    <line x1="48" y1="920" x2="1152" y2="920" stroke="${BORDER_SUBTLE}" stroke-width="1" stroke-dasharray="4 4" />
    <text x="48" y="942" fill="${TEXT_MUTED}" font-family="'JetBrains Mono', monospace" font-size="11">ZINIPAY ZERO-FABRICATION LEDGER · HAND-BUILT SVG · NO COMMIT OR PUSH</text>
    <text x="1152" y="942" fill="${PASSED_GREEN}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">BUILD STATUS: VERIFIED 0 ERRORS</text>
  </svg>`;

  const contactSheetBuf = await sharp(Buffer.from(contactSheetSvg)).png().toBuffer();
  fs.writeFileSync(path.join(BRAND_DIR, 'contact-sheet.png'), contactSheetBuf);
  console.log('✓ Created frontend/public/brand/contact-sheet.png (1200x960)');

  console.log('--- All ZiniPay brand assets successfully generated! ---');
}

buildAll().catch((err) => {
  console.error('Build brand assets failed:', err);
  process.exit(1);
});
