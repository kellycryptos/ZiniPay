import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runDeliberation, DeliberationRequest } from './lib/deliberation.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const deliberationRequest: DeliberationRequest = {
      taskDescription: body.taskDescription || 'Core treasury security review and proof verification',
      deliverable: body.deliverable || 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      amountNear: body.amountNear ? String(body.amountNear) : '10',
      recipientId: body.recipientId || 'contributor.testnet',
      recipientReputation: typeof body.recipientReputation === 'number' ? body.recipientReputation : 45,
    };

    const receipt = runDeliberation(deliberationRequest);

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal deliberation error',
    });
  }
}
