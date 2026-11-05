/**
 * server.mjs — Zero-Config Production & Evaluation HTTP Server
 *
 * Requirements satisfied:
 *   - Root package.json `npm start` listening on PORT 3000 / $PORT
 *   - Unauthenticated GET /health and GET /api/health returning HTTP 200 OK
 *   - Serves static assets from frontend/dist with SPA fallback to index.html
 *   - Zero dependencies outside standard Node.js built-ins
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'frontend', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

function sendHealthResponse(res) {
  const healthData = {
    status: 'ok',
    service: 'zinipay',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    mode: 'production',
    demoMode: true,
    network: process.env.NEAR_NETWORK || 'testnet',
    contracts: {
      sputnikDao: process.env.DAO_CONTRACT_ID || 'zinipay-demo.sputnikv2.testnet',
      policyHelper: process.env.POLICY_CONTRACT_ID || 'zinipay-policy2.testnet',
    },
    verification: {
      gates: 3,
      teeAttestation: 'NEAR AI Cloud (Fail-Closed)',
      crossChainIntents: 'ChainDefuser 1Click',
    },
    routes: ['/', '/app', '/board', '/health', '/api/health'],
  };

  const body = JSON.stringify(healthData, null, 2);
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // 1. Unauthenticated Health Check Endpoints (/health, /api/health)
  if (urlPath === '/health' || urlPath === '/api/health') {
    sendHealthResponse(res);
    return;
  }

  // 1b. Simulation Propose Endpoint for Zero-Config Sandbox
  if (urlPath === '/api/propose' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', (chunk) => {
      bodyData += chunk;
    });
    req.on('end', () => {
      let parsed = {};
      try {
        parsed = JSON.parse(bodyData || '{}');
      } catch {
        parsed = {};
      }
      const amountNear = parseFloat(parsed.amountNear || '1');
      const isOverCap = amountNear > 15;

      const responsePayload = {
        ok: !isOverCap,
        simulated: true,
        deliberation: {
          consensusApproved: !isOverCap,
          overallConfidence: isOverCap ? 20 : 96,
          inspector: {
            approved: !isOverCap,
            score: isOverCap ? 20 : 95,
            critique: isOverCap
              ? 'Deliverable exceeds policy spend caps. Rejected fail-closed.'
              : 'Merged GitHub PR verified and identity bound. Artifact matches task scope.',
          },
          riskArbiter: {
            approved: !isOverCap,
            riskLevel: isOverCap ? 'HIGH' : 'LOW',
            policyNotes: isOverCap
              ? 'Over-cap transaction blocked by PolicyHelper spend limits.'
              : 'Amount is within contributor reputation tier limit.',
          },
          attestationSummary: isOverCap
            ? 'FAIL: Over-Cap Exposure'
            : 'ZiniPay Dual-Agent TEE Attestation Verified',
          reviewType: 'multi-agent-deliberation',
        },
        policy: {
          withinCap: !isOverCap,
          cooldownElapsed: true,
          cidUnique: true,
        },
      };

      const resBody = JSON.stringify(responsePayload, null, 2);
      res.writeHead(isOverCap ? 400 : 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': Buffer.byteLength(resBody),
      });
      res.end(resBody);
    });
    return;
  }

  // 2. Static Asset Delivery from frontend/dist
  if (!fs.existsSync(DIST_DIR)) {
    // If frontend hasn't been built yet, show informative fallback
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>ZiniPay — Build Required</title><style>body{background:#0A0A0C;color:#fff;font-family:sans-serif;padding:40px;line-height:1.6;}</style></head>
        <body>
          <h2>ZiniPay Frontend Dist Not Found</h2>
          <p>Please run <code>npm run build</code> first to generate the production bundle.</p>
          <p>Health check is active: <a href="/health" style="color:#00EC97">/health</a></p>
        </body>
      </html>
    `);
    return;
  }

  let filePath = path.join(DIST_DIR, urlPath);

  // If path is a directory or root, default to index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist, SPA fallback to frontend/dist/index.html
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`500 Internal Server Error: ${err.message}`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 [ZiniPay] HTTP Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`🩺 [ZiniPay] Health check: http://localhost:${PORT}/health & http://localhost:${PORT}/api/health`);
  console.log(`🌐 [ZiniPay] Serving static UI from ${DIST_DIR}\n`);
});
