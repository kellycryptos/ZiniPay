/**
 * intents.ts — NEAR Intents 1Click API wrapper
 *
 * Used for cross-chain settlement AFTER a DAO proposal is approved.
 * Instead of a plain NEAR transfer, the agent can route payment to
 * a recipient on any chain (ETH, BTC, SOL, etc.) via the 1Click API.
 *
 * Flow:
 *   1. Request a quote for the swap (e.g. 5 NEAR → 5 USDC on Ethereum)
 *   2. Receive a deposit address on NEAR
 *   3. The DAO Transfer goes to that deposit address
 *   4. 1Click routes the funds to the destination chain atomically
 *
 * Reference: https://1click.chaindefuser.com
 */

import axios from 'axios';
import type { ProposalKind } from './dao.js';

export interface QuoteRequest {
  /** Token to send from NEAR treasury (e.g. "near" or "nep141:usdt.tether-token.near") */
  tokenIn: string;
  /** Amount in smallest unit (yoctoNEAR or token's smallest unit) */
  amountIn: string;
  /** Destination token (e.g. "eth:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" for USDC on ETH) */
  tokenOut: string;
  /** Final recipient address on destination chain */
  recipientAddress: string;
  /** Destination chain slug (e.g. "ethereum", "bitcoin", "solana") */
  destinationChain: string;
}

export interface QuoteResponse {
  /** Deposit address on NEAR that the DAO should send funds to */
  depositAddress: string;
  /** Estimated amount the recipient will receive */
  amountOut: string;
  /** Quote expiry (unix ms) */
  expiresAt: number;
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
    this.baseUrl = baseUrl;
  }

  /**
   * Get a cross-chain swap quote.
   * Returns a deposit address on NEAR — the DAO Transfer should go here.
   */
  async getQuote(req: QuoteRequest): Promise<QuoteResponse> {
    const response = await axios.post(`${this.baseUrl}/v1/quote`, {
      token_in: req.tokenIn,
      amount_in: req.amountIn,
      token_out: req.tokenOut,
      recipient_address: req.recipientAddress,
      destination_chain: req.destinationChain,
    });

    const data = response.data;
    return {
      depositAddress: data.deposit_address,
      amountOut: data.amount_out,
      expiresAt: data.expires_at,
      quoteId: data.quote_id,
      estimatedTimeSeconds: data.estimated_time_seconds ?? 60,
    };
  }

  /**
   * Check the status of a cross-chain swap by quote ID.
   */
  async getStatus(quoteId: string): Promise<SwapStatus> {
    const response = await axios.get(`${this.baseUrl}/v1/status/${quoteId}`);
    const data = response.data;
    return {
      quoteId,
      status: data.status,
      txHash: data.tx_hash,
      completedAt: data.completed_at,
    };
  }

  /**
   * Helper: build a proposal Transfer kind that routes via NEAR Intents.
   * Instead of paying the recipient directly, the DAO pays the deposit address,
   * and 1Click handles the rest.
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
          // Attach the quote ID in the memo so the relay can match it
          msg: JSON.stringify({ quote_id: quote.quoteId, recipient: req.recipientAddress }),
        },
      },
      intentDepositAddress: quote.depositAddress,
      quote,
    };
  }
}
