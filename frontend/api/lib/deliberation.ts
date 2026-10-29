/**
 * deliberation.ts — Multi-Agent Deliberation & Proof Evaluation
 * Note: Never fabricates synthetic TEE quotes or cryptographic signatures.
 * Explicitly marks simulated: true and reviewType: 'format-check-only'.
 */

import { getTierInfo, type ReputationTier } from './reputation.js';

export interface DeliberationRequest {
  taskDescription: string;
  deliverable: string;
  amountNear: string;
  recipientId: string;
  recipientReputation: number;
}

export interface InspectorReview {
  approved: boolean;
  score: number;             // 0-100
  reviewType: 'format-check-only';
  critique: string;
  artifactVerified: boolean;
}

export interface RiskReview {
  approved: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reputationTier: ReputationTier;
  recommendedMultiplier: number;
  policyNotes: string;
}

export interface DeliberationReceipt {
  simulated: boolean;
  reviewType: 'format-check-only';
  consensusApproved: boolean;
  overallConfidence: number;
  match1_ScopeAligned: boolean;
  match2_ProofVerified: boolean;
  match3_PolicyCleared: boolean;
  inspector: InspectorReview;
  riskArbiter: RiskReview;
  attestationSummary: string;
  teeVerification: null; // Explicitly null — no fake signatures or quotes
}

export function runDeliberation(req: DeliberationRequest): DeliberationReceipt {
  const tierInfo = getTierInfo(req.recipientReputation);
  const amount = parseFloat(req.amountNear) || 0;
  
  const isSubstantive = req.deliverable.length > 5 && (
    req.deliverable.startsWith('http://') ||
    req.deliverable.startsWith('https://') ||
    req.deliverable.startsWith('ipfs://') ||
    req.deliverable.startsWith('bafy') ||
    req.deliverable.startsWith('Qm')
  );

  const score = isSubstantive ? Math.min(98, 85 + Math.floor(req.recipientReputation / 10)) : 40;
  const inspectorApproved = score >= 70;
  
  // Policy contract base cap is 10 NEAR (Bronze: 10N, Silver: 15N, Gold: 20N)
  const baseCap = 10;
  const effectiveTierCap = baseCap * tierInfo.maxPerProposalMultiplier;

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    amount > effectiveTierCap ? 'HIGH' : amount > baseCap ? 'MEDIUM' : 'LOW';

  const riskApproved = riskLevel !== 'HIGH';

  const match1_Scope = inspectorApproved;
  const match2_Proof = isSubstantive;
  const match3_Policy = riskApproved;

  const consensusApproved = match1_Scope && match2_Proof && match3_Policy;
  const overallConfidence = Math.round((score + (riskLevel === 'LOW' ? 96 : riskLevel === 'MEDIUM' ? 80 : 40)) / 2);

  const matchCount = (match1_Scope ? 1 : 0) + (match2_Proof ? 1 : 0) + (match3_Policy ? 1 : 0);
  const attestationSummary = `[Three-Way Match: ${matchCount}/3 ${consensusApproved ? 'PASS' : 'FAIL'}] [Tier: ${tierInfo.tier}] [Review: format-check-only] Inspector: ${score}/100, Risk: ${riskLevel} | Deliverable: ${req.deliverable}`;

  return {
    simulated: true, // Explicitly labeled simulation (no fake TEE enclave)
    reviewType: 'format-check-only',
    consensusApproved,
    overallConfidence,
    match1_ScopeAligned: match1_Scope,
    match2_ProofVerified: match2_Proof,
    match3_PolicyCleared: match3_Policy,
    inspector: {
      approved: inspectorApproved,
      score,
      reviewType: 'format-check-only',
      critique: isSubstantive
        ? 'Format check only: no model reviewed the deliverable. Deliverable artifact format matches URL/CID pattern.'
        : 'Deliverable proof format invalid or missing',
      artifactVerified: isSubstantive,
    },
    riskArbiter: {
      approved: riskApproved,
      riskLevel,
      reputationTier: tierInfo.tier,
      recommendedMultiplier: tierInfo.multiplier,
      policyNotes: `Requested ${amount} NEAR evaluated against policy contract ${tierInfo.tier} tier cap (${effectiveTierCap} NEAR)`,
    },
    attestationSummary,
    teeVerification: null,
  };
}
