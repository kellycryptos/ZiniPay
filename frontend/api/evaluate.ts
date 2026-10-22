import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evaluatePolicy } from './lib/policy.js';
import { getReputation } from './lib/reputation.js';

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
    const { recipientId, amountNear, deliverableCid } = req.body || {};

    if (!recipientId) {
      return res.status(400).json({ error: 'Missing required field: recipientId' });
    }

    const repEntry = getReputation(recipientId);
    const amount = typeof amountNear === 'number' ? amountNear : parseFloat(amountNear || '0');

    const result = evaluatePolicy(
      recipientId,
      amount,
      deliverableCid || '',
      repEntry.score
    );

    return res.status(200).json({
      success: true,
      data: {
        recipientId,
        reputation: repEntry,
        evaluation: result,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal policy evaluation error',
    });
  }
}
