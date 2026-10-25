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

export const KNOWN_INTENT_ASSETS: Record<string, Record<string, string>> = {
  ethereum: {
    usdc: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
    usdt: 'nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near',
    eth: 'nep141:eth.omft.near',
  },
  eth: {
    usdc: 'nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
    usdt: 'nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near',
    eth: 'nep141:eth.omft.near',
  },
  solana: {
    usdc: 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near',
  },
  sol: {
    usdc: 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near',
  },
  base: {
    usdc: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
  },
  arbitrum: {
    usdc: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
  },
  arb: {
    usdc: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
  },
};

export interface QuoteRequest {
  /** Token to send from NEAR treasury (e.g. "near" or "wrap.near" or "nep141:wrap.near") */
  tokenIn: string;
  /** Amount in smallest unit (yoctoNEAR or token's smallest unit) */
  amountIn: string;
  /** Destination token (e.g. "usdc" or "nep141:eth-0xa0b8...omft.near") */
  tokenOut: string;
  /** Final recipient address on destination chain */
  recipientAddress: string;
  /** Destination chain slug (e.g. "ethereum", "solana", "base", "arbitrum") */
  destinationChain: string;
  /** Refund address on origin chain (NEAR account) */
  refundTo?: string;
  /** Slippage tolerance in basis points (default: 100 = 1%) */
  slippageTolerance?: number;
  /** Quote deadline ISO string */
  deadline?: string;
  /** Simulation flag (does not lock solvers) */
  dry?: boolean;
}

export interface QuoteResponse {
  /** Deposit address on NEAR that the DAO should send funds to */
  depositAddress: string;
  /** Estimated amount the recipient will receive */
  amountOut: string;
  /** Formatted human-readable amount out */
  amountOutFormatted?: string;
  /** Quote deadline ISO string */
  deadline?: string;
  /** Unique quote correlation ID */
  correlationId?: string;
  /** Quote ID alias */
  quoteId?: string;
  /** Estimated settlement time in seconds */
  estimatedTimeSeconds: number;
}

export type SwapStatusCode =
  | 'PENDING_DEPOSIT'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'EXPIRED'
  | 'FAILED'
  | 'REFUNDED'
  | 'UNKNOWN';

export interface SwapStatus {
  depositAddress: string;
  status: SwapStatusCode;
  isTerminal: boolean;
  txHashes: string[];
  updatedAt?: string;
  raw?: any;
}

export class NearIntents {
  private baseUrl: string;

  constructor(baseUrl = 'https://1click.chaindefuser.com') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Resolve an asset identifier to the format expected by the 1Click solver network
   */
  resolveAssetId(chain: string, token: string): string {
    const trimmed = token.trim();
    if (trimmed.startsWith('nep141:') || trimmed.startsWith('nep245:') || trimmed.startsWith('1cs_')) {
      return trimmed;
    }

    const chainMap = KNOWN_INTENT_ASSETS[chain.toLowerCase()];
    if (chainMap && chainMap[trimmed.toLowerCase()]) {
      return chainMap[trimmed.toLowerCase()];
    }

    // Default fallback format
    return trimmed;
  }

  /**
   * Get a cross-chain swap quote from NEAR Intents 1Click API (POST /v0/quote).
   * Returns a solver deposit address on NEAR where the DAO proposal should route funds.
   */
  async getQuote(req: QuoteRequest): Promise<QuoteResponse> {
    const originAsset =
      req.tokenIn.startsWith('nep141:') || req.tokenIn === 'wrap.near'
        ? req.tokenIn
        : req.tokenIn.toLowerCase() === 'near'
          ? 'nep141:wrap.near'
          : `nep141:${req.tokenIn}`;

    const destinationAsset = this.resolveAssetId(req.destinationChain, req.tokenOut);

    const deadline = req.deadline || new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const slippageTolerance = req.slippageTolerance ?? 100;
    const refundTo = req.refundTo || 'alice.near';

    const body = {
      dry: req.dry ?? false,
      swapType: 'EXACT_INPUT',
      originAsset,
      destinationAsset,
      amount: req.amountIn,
      depositType: 'ORIGIN_CHAIN',
      recipient: req.recipientAddress,
      recipientType: 'DESTINATION_CHAIN',
      refundTo,
      refundType: 'ORIGIN_CHAIN',
      slippageTolerance,
      deadline,
    };

    const response = await axios.post(`${this.baseUrl}/v0/quote`, body);
    const data = response.data;
    const quote = data.quote ?? data;

    return {
      depositAddress: quote.depositAddress || data.quoteRequest?.recipient || '',
      amountOut: quote.amountOut || '0',
      amountOutFormatted: quote.amountOutFormatted,
      deadline: quote.deadline || deadline,
      correlationId: data.correlationId,
      quoteId: data.correlationId,
      estimatedTimeSeconds: quote.timeEstimate || 30,
    };
  }

  /**
   * Check swap status by deposit address (GET /v0/status?depositAddress=...).
   * Handles active, expired, completed, and failed statuses.
   */
  async getStatus(depositAddress: string): Promise<SwapStatus> {
    if (!depositAddress) {
      return {
        depositAddress: '',
        status: 'UNKNOWN',
        isTerminal: true,
        txHashes: [],
      };
    }

    const response = await axios.get(`${this.baseUrl}/v0/status`, {
      params: { depositAddress },
    });

    const data = response.data;
    const statusStr: string = (data.status || 'UNKNOWN').toUpperCase();

    let status: SwapStatusCode = 'UNKNOWN';
    if (statusStr.includes('PENDING')) status = 'PENDING_DEPOSIT';
    else if (statusStr.includes('SUCCESS') || statusStr.includes('COMPLETED')) status = 'SUCCESS';
    else if (statusStr.includes('EXPIRED')) status = 'EXPIRED';
    else if (statusStr.includes('FAIL')) status = 'FAILED';
    else if (statusStr.includes('REFUND')) status = 'REFUNDED';
    else if (statusStr.includes('PROCESS')) status = 'PROCESSING';

    const isTerminal = ['SUCCESS', 'EXPIRED', 'FAILED', 'REFUNDED'].includes(status);
    const txHashes = [
      ...(data.swapDetails?.destinationChainTxHashes || []),
      ...(data.swapDetails?.nearTxHashes || []),
    ];

    return {
      depositAddress,
      status,
      isTerminal,
      txHashes,
      updatedAt: data.updatedAt,
      raw: data,
    };
  }

  /**
   * Poll status until a terminal state (SUCCESS, EXPIRED, FAILED) is reached or timeout.
   */
  async pollStatus(
    depositAddress: string,
    timeoutMs = 60000,
    intervalMs = 3000
  ): Promise<SwapStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const current = await this.getStatus(depositAddress);
      if (current.isTerminal) {
        return current;
      }
      await new Promise((res) => setTimeout(res, intervalMs));
    }

    const finalCheck = await this.getStatus(depositAddress);
    return finalCheck;
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
          msg: JSON.stringify({
            correlation_id: quote.correlationId,
            destination_chain: req.destinationChain,
            recipient: req.recipientAddress,
          }),
        },
      },
      intentDepositAddress: quote.depositAddress,
      quote,
    };
  }
}
