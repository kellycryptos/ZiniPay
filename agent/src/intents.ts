/**
 * intents.ts — NEAR Intents 1Click API wrapper
 *
 * Used for cross-chain settlement AFTER a DAO proposal is approved.
 * Instead of a plain NEAR transfer, the agent can route payment to
 * a recipient on another chain (ETH, BTC, SOL, etc.) via the official 1Click API.
 *
 * Flow:
 *   1. Request an intent quote (POST /v0/quote)
 *   2. Receive a solver deposit address on NEAR
 *   3. The Sputnik DAO proposal transfers funds to that deposit address
 *   4. Decentralized solvers settle the funds to the destination chain
 *
 * Reference: https://1click.chaindefuser.com
 */

import axios from 'axios';
import type { ProposalKind } from './dao.js';

export interface QuoteRequest {
  /** Token to send from NEAR treasury (e.g. "near" or "wrap.near" or "nep141:usdt.tether-token.near") */
  tokenIn: string;
  /** Amount in smallest unit (yoctoNEAR or token's smallest unit) */
  amountIn: string;
  /** Destination token (e.g. "eth:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" or "usdc") */
  tokenOut: string;
  /** Final recipient address on destination chain */
  recipientAddress: string;
  /** Destination chain slug (e.g. "ethereum", "bitcoin", "solana") */
  destinationChain: string;
  /** Optional refund address if swap cannot be fulfilled */
  refundTo?: string;
  /** Optional simulation flag */
  dry?: boolean;
}

export interface QuoteResponse {
  /** Deposit address on NEAR that the DAO should send funds to */
  depositAddress: string;
  /** Estimated amount the recipient will receive */
  amountOut: string;
  /** Quote deadline (ISO timestamp or string) */
  deadline?: string;
  /** Unique quote ID for tracking */
  quoteId: string;
  /** Estimated settlement time in seconds */
  estimatedTimeSeconds: number;
}

export interface SwapStatus {
  quoteId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  completedAt?: number;
}

export class NearIntents {
  private baseUrl: string;

  constructor(baseUrl = 'https://1click.chaindefuser.com') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Get a cross-chain swap quote from NEAR Intents 1Click API (POST /v0/quote).
   * Returns a solver deposit address on NEAR where the DAO proposal should route funds.
   */
  async getQuote(req: QuoteRequest): Promise<QuoteResponse> {
    const originAsset =
      req.tokenIn.startsWith('nep141:') || req.tokenIn === 'wrap.near'
        ? req.tokenIn
        : req.tokenIn === 'near'
          ? 'nep141:wrap.near'
          : `nep141:${req.tokenIn}`;

    const destinationAsset = req.tokenOut.includes(':')
      ? req.tokenOut
      : `${req.destinationChain}:${req.tokenOut}`;

    const body = {
      dry: req.dry ?? false,
      swapType: 'EXACT_INPUT',
      originAsset,
      destinationAsset,
      amount: req.amountIn,
      depositType: 'ORIGIN_CHAIN',
      recipient: req.recipientAddress,
      recipientType: 'DESTINATION_CHAIN',
      refundTo: req.refundTo ?? req.recipientAddress,
      refundType: 'ORIGIN_CHAIN',
    };

    const response = await axios.post(`${this.baseUrl}/v0/quote`, body);
    const data = response.data;
    const quote = data.quote ?? data;

    return {
      depositAddress: quote.depositAddress ?? quote.deposit_address,
      amountOut: quote.amountOut ?? quote.amount_out,
      deadline: quote.deadline ?? quote.expires_at,
      quoteId: quote.quoteId ?? quote.quote_id ?? quote.id,
      estimatedTimeSeconds: quote.timeEstimate ?? quote.estimated_time_seconds ?? 60,
    };
  }

  /**
   * Check the status of a cross-chain swap by quote ID.
   */
  async getStatus(quoteId: string): Promise<SwapStatus> {
    const response = await axios.get(`${this.baseUrl}/v0/quote/${quoteId}`);
    const data = response.data;
    return {
      quoteId,
      status: data.status,
      txHash: data.txHash ?? data.tx_hash,
      completedAt: data.completedAt ?? data.completed_at,
    };
  }

  /**
   * Helper: build a proposal Transfer kind that routes via NEAR Intents.
   * Instead of paying the recipient directly, the DAO pays the solver deposit address.
   */
  async buildCrossChainTransfer(req: QuoteRequest): Promise<{
    kind: ProposalKind;
    intentDepositAddress: string;
    quote: QuoteResponse;
  }> {
    const quote = await this.getQuote(req);

    return {
      kind: {
        Transfer: {
          token_id: req.tokenIn === 'near' ? '' : req.tokenIn.replace('nep141:', ''),
          receiver_id: quote.depositAddress,
          amount: req.amountIn,
          msg: JSON.stringify({ quote_id: quote.quoteId, recipient: req.recipientAddress }),
        },
      },
      intentDepositAddress: quote.depositAddress,
      quote,
    };
  }
}
