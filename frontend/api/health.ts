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
    sputnikDao: process.env.VITE_DAO_CONTRACT_ID || process.env.DAO_CONTRACT_ID || '',
    contracts: {
      sputnikDaoFactory: 'sputnikv2.testnet',
      sputnikDaoContract: process.env.VITE_DAO_CONTRACT_ID || process.env.DAO_CONTRACT_ID || '',
      policyGuard: process.env.VITE_POLICY_CONTRACT_ID || process.env.POLICY_CONTRACT_ID || '',
    },
    features: [
      'Three-Way Match Verification (CID Proof, Caps, Anti-Replay)',
      'Dual-Agent Deliberation (Inspector + Risk Arbiter)',
      'NEAR AI Cloud Deliberation (cloud-api.near.ai)',
      'NEAR Intents 1Click Multi-Chain Settlement',
      'Reputation Tier Scaling (Bronze, Silver, Gold)',
    ],
    timestamp: new Date().toISOString(),
  });
}
