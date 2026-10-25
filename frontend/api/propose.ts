import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runDeliberation } from './lib/deliberation.js';
import { evaluatePolicy, checkOnChainCidUsed } from './lib/policy.js';
import { getReputation } from './lib/reputation.js';

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
    const {
      daoId = 'genesis.sputnikv2.testnet',
      recipientId = 'contributor.testnet',
      amountNear = '10',
      deliverableCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      taskDescription = 'Security review and proof match verification',
    } = req.body || {};

    // 1. Contributor reputation lookup
    const reputation = getReputation(recipientId);

    // 2. Policy check
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

    // 3. Multi-agent deliberation & TEE receipt
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

    // 4. Construct Sputnik DAO proposal payload
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
      deposit: '100000000000000000000000', // 0.1 NEAR bond
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
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error crafting proposal',
    });
  }
}
