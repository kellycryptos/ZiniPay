import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import axios from 'axios';

const IntentsQuoteSchema = z.object({
  tokenIn: z.string().trim().default('near'),
  amountIn: z.string().trim().default('10000000000000000000000000'),
  tokenOut: z.string().trim().default('USDC'),
  recipientAddress: z.string().trim().default(''),
  destinationChain: z.string().trim().default('ethereum'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const parseResult = IntentsQuoteSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid intents quote payload',
      details: parseResult.error.format(),
    });
  }

  try {
    const { tokenIn, amountIn, tokenOut, recipientAddress, destinationChain } = parseResult.data;

    // Call live NEAR Intents 1Click API
    try {
      const response = await axios.post(
        'https://1click.chaindefuser.com/v1/quote',
        {
          token_in: tokenIn,
          amount_in: amountIn,
          token_out: tokenOut,
          recipient_address: recipientAddress,
          destination_chain: destinationChain,
        },
        { timeout: 5000 }
      );

      return res.status(200).json({
        success: true,
        source: 'live-1click-defuse',
        data: response.data,
      });
    } catch (upstreamErr: any) {
      return res.status(502).json({
        success: false,
        error: 'NEAR Intents 1Click service temporarily unavailable',
      });
    }
  } catch (error: any) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.error(`[${requestId}] Intents endpoint failure:`, error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Internal intents quote error',
      requestId,
    });
  }
}
