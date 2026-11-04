import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { runDeliberation } from './lib/deliberation.js';
import { evaluatePolicy, checkOnChainCidUsed } from './lib/policy.js';
import { getReputation } from './lib/reputation.js';

// ─── Input Validation Schema ──────────────────────────────────────────────────

const ProposeSchema = z.object({
  daoId: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9_.-]+$/, 'Invalid DAO contract account ID format')
    .optional(),
  recipientId: z
    .string()
    .trim()
    .min(2, 'Recipient ID required')
    .max(64)
    .regex(/^[a-z0-9_.-]+$/, 'Invalid recipient NEAR account ID format'),
  amountNear: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num > 0 && num <= 100;
    }, 'amountNear must be a positive number up to 100 NEAR'),
  deliverableCid: z
    .string()
    .trim()
    .min(3, 'Deliverable CID/proof must be at least 3 characters')
    .max(500),
  taskDescription: z
    .string()
    .trim()
    .min(3, 'Task description must be at least 3 characters')
    .max(1000),
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

  // 1. Strict Zod input validation
  const parseResult = ProposeSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid proposal request payload',
      details: parseResult.error.format(),
    });
  }

  const {
    recipientId,
    amountNear,
    deliverableCid,
    taskDescription,
  } = parseResult.data;

  const daoId =
    parseResult.data.daoId ||
    process.env.VITE_DAO_CONTRACT_ID ||
    process.env.DAO_CONTRACT_ID ||
    'zinipay-demo.sputnikv2.testnet';

  try {
    // 2. Contributor reputation lookup (local cache)
    const reputation = getReputation(recipientId);

    // 3. Policy check
    const policyContractId = process.env.POLICY_CONTRACT_ID || process.env.VITE_POLICY_CONTRACT_ID;
    if (policyContractId) {
      const isCidUsed = await checkOnChainCidUsed(policyContractId, deliverableCid);
      if (isCidUsed) {
        return res.status(400).json({
          success: false,
          error: `Three-Way Match Failed: Deliverable proof ${deliverableCid} has already been settled on-chain (zero-double-spend protection).`,
        });
      }
    }

    const policyResult = evaluatePolicy(
      recipientId,
      parseFloat(amountNear),
      deliverableCid,
      reputation.score
    );

    if (!policyResult.allowed) {
      return res.status(400).json({
        success: false,
        error: policyResult.reason,
        policyResult,
      });
    }

    // 4. Multi-agent deliberation via NEAR AI Cloud
    const deliberation = runDeliberation({
      taskDescription,
      deliverable: deliverableCid,
      amountNear,
      recipientId,
      recipientReputation: reputation.score,
    });

    if (!deliberation.consensusApproved) {
      return res.status(400).json({
        success: false,
        error: 'Multi-agent consensus rejected proposal.',
        deliberation,
      });
    }

    // 5. Construct Sputnik DAO proposal payload (1.0 NEAR proposal bond matching on-chain DAO policy)
    const yoctoAmount = (BigInt(Math.floor(parseFloat(amountNear) * 1000)) * 1_000_000_000_000_000_000_000n).toString();
    const proposalPayload = {
      daoContract: daoId,
      methodName: 'add_proposal',
      args: {
        proposal: {
          description: `${taskDescription} | ${deliberation.attestationSummary}`,
          kind: {
            Transfer: {
              token_id: '',
              receiver_id: recipientId,
              amount: yoctoAmount,
            },
          },
        },
      },
      gas: '300000000000000',
      deposit: '1000000000000000000000000', // 1.0 NEAR bond (matches on-chain Sputnik DAO proposal_bond)
    };

    return res.status(200).json({
      success: true,
      simulated: true,
      message: 'Proposal successfully validated and payload prepared for Sputnik DAO submission.',
      proposalPayload,
      deliberation,
      policy: policyResult,
    });
  } catch (error: any) {
    // Mask error.message and return opaque error with unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.error(`[${requestId}] Proposal crafting error:`, error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Internal error crafting proposal',
      requestId,
    });
  }
}
