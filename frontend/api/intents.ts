import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

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

  try {
    const { tokenIn, amountIn, tokenOut, recipientAddress, destinationChain } = req.body || {};

    const targetChain = destinationChain || 'ethereum';
    const targetToken = tokenOut || 'USDC';

    // Call live NEAR Intents 1Click API
    try {
      const response = await axios.post(
        'https://1click.chaindefuser.com/v1/quote',
        {
          token_in: tokenIn || 'near',
          amount_in: amountIn || '10000000000000000000000000',
          token_out: targetToken,
          recipient_address: recipientAddress || '',
          destination_chain: targetChain,
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
        error: `NEAR Intents 1Click service unavailable: ${upstreamErr.response?.data?.message || upstreamErr.message}`,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal intents quote error',
    });
  }
}
