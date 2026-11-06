import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { evaluatePolicy } from './lib/policy.js';
import { getReputation } from './lib/reputation.js';

const EvaluateSchema = z.object({
  recipientId: z.string().trim().min(2).max(64).regex(/^[a-z0-9_.-]+$/, 'Invalid NEAR account ID format'),
  amountNear: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((v) => {
    const num = parseFloat(v);
    return !isNaN(num) && num > 0 && num <= 100;
  }, 'amountNear must be a positive number up to 100 NEAR'),
  deliverableCid: z.string().trim().max(500).optional().default(''),
});

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

  const parseResult = EvaluateSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid evaluation request payload',
      details: parseResult.error.format(),
    });
  }

  try {
    const { recipientId, amountNear, deliverableCid } = parseResult.data;
    const repEntry = getReputation(recipientId);
    const amount = parseFloat(amountNear);

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
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.error(`[${requestId}] Policy evaluation failure:`, error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Internal policy evaluation error',
      requestId,
    });
  }
}
