import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { runDeliberation, DeliberationRequest } from './lib/deliberation.js';

// ─── Input Validation Schema ──────────────────────────────────────────────────

const DeliberateSchema = z.object({
  taskDescription: z.string().trim().min(3, 'Task description must be at least 3 characters').max(1000),
  deliverable: z.string().trim().min(3, 'Deliverable must be at least 3 characters').max(500),
  amountNear: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((v) => {
    const num = parseFloat(v);
    return !isNaN(num) && num > 0 && num <= 100;
  }, 'amountNear must be a positive number up to 100 NEAR'),
  recipientId: z.string().trim().min(2).max(64).regex(/^[a-z0-9_.-]+$/, 'Invalid NEAR account ID format'),
  recipientReputation: z.number().int().min(0).max(1000).default(0),
});

// ─── Best-Effort In-Memory Rate Limiting ────────────────────────────────────────
// NOTE: Vercel serverless functions are ephemeral. This in-memory sliding window
// provides best-effort local protection per warm container. Hard spend protection
// is configured directly via provider billing quotas.

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function getClientIp(req: VercelRequest): string {
  // Read Vercel-set client IP headers first
  const xRealIp = req.headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.trim()) return xRealIp.trim();

  const vercelForwardedFor = req.headers['x-vercel-forwarded-for'];
  if (typeof vercelForwardedFor === 'string' && vercelForwardedFor.trim()) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  // Prune expired entries to prevent memory leaks in warm lambdas
  if (rateLimitMap.size > 500) {
    for (const [key, entry] of rateLimitMap.entries()) {
      const active = entry.timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, { timestamps: active });
      }
    }
  }

  const existing = rateLimitMap.get(ip);
  const activeTimestamps = existing ? existing.timestamps.filter((ts) => ts > cutoff) : [];

  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: activeTimestamps });
  return true;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

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

  // 1. Rate limit check (5 requests / min per IP)
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded: maximum 5 deliberation requests per minute.',
    });
  }

  // 2. Strict Zod input validation
  const parseResult = DeliberateSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid deliberation request payload',
      details: parseResult.error.format(),
    });
  }

  try {
    const validated = parseResult.data;
    const deliberationRequest: DeliberationRequest = {
      taskDescription: validated.taskDescription,
      deliverable: validated.deliverable,
      amountNear: validated.amountNear,
      recipientId: validated.recipientId,
      recipientReputation: validated.recipientReputation,
    };

    const receipt = runDeliberation(deliberationRequest);

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error: any) {
    // Mask error.message and return opaque error with unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.error(`[${requestId}] Deliberation endpoint failure:`, error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Internal deliberation error',
      requestId,
    });
  }
}
