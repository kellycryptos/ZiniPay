import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'online',
    version: '1.0.0',
    service: 'ZiniPay Agent Layer & Deliberation Engine',
    network: 'near-testnet',
    sputnikDao: 'genesis.sputnikv2.testnet',
    contracts: {
      sputnikDaoFactory: 'sputnikv2.testnet',
      sputnikDaoContract: 'genesis.sputnikv2.testnet',
      policyGuard: 'zinipay-policy.testnet',
    },
    features: [
      'Three-Way Match Verification (CID Proof, Caps, Anti-Replay)',
      'Dual-Agent Deliberation (Inspector + Risk Arbiter)',
      'NEAR AI Cloud TEE Receipts (Intel TDX)',
      'NEAR Intents 1Click Multi-Chain Settlement',
      'Reputation Tier Scaling (Bronze, Silver, Gold)',
    ],
    timestamp: new Date().toISOString(),
  });
}
