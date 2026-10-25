export type PolicyCheckStatus = {
  withinCap: boolean;
  capLimit: string;
  cooldownElapsed: boolean;
  cooldownRemainingSecs: number;
  cidUnique: boolean;
  reputationQualified: boolean;
  reputationScore: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
};

export type SettlementRoute = {
  type: 'native_near' | 'cross_chain_intent';
  targetChain: 'near' | 'ethereum' | 'solana' | 'bitcoin';
  targetToken: string;
  recipientAddress: string;
  quoteEstimate?: string;
};

export type Proposal = {
  id: number;
  title: string;
  proposer: string;
  recipient: string;
  amountNear: string;
  amountYocto: string;
  proofCid: string;
  summary: string;
  evidenceType: 'github_pr' | 'milestone_deliverable' | 'signal_audit';
  evidenceDetails: string;
  createdAt: string;
  status: 'pending_quorum' | 'approved' | 'settled' | 'rejected';
  simulated?: boolean;
  txHash?: string;
  attestationHash?: string;
  targetContract?: string;
  policy: PolicyCheckStatus;
  settlement: SettlementRoute;
  votes: {
    approve: number;
    reject: number;
    required: number;
  };
};

export type AttackAttempt = {
  id: string;
  timestamp: string;
  vector: 'Replay CID' | 'Over-Cap Spend' | 'Unauthorized Release' | 'Stolen / Unmerged PR';
  caller: string;
  details: string;
  rejectionReason: string;
  blockedBy: 'PolicyHelper (On-Chain)' | 'Three-Way Match Agent' | 'NEAR AI Deliberation';
};

export type PolicyMetricsData = {
  perProposalCapNear: number;
  dailyCapNear: number;
  dailySpentNear: number;
  cooldownHours: number;
  minReputation: number;
  treasuryBalanceNear: number;
  activeAgents: number;
  totalSettledNear: number;
};

export type ActivityEvent = {
  id: string;
  timestamp: string;
  type: 'policy_pass' | 'proposal_created' | 'quorum_reached' | 'intent_settled' | 'rep_updated';
  title: string;
  description: string;
  badge?: string;
};
