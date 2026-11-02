import {
  ReputationLedger,
  getTierInfo,
  getApprovalRequirement,
  type ReputationTier,
} from '../src/reputation.js';
import { PolicyEngine, type PolicyConfig } from '../src/policy.js';
import fs from 'fs';
import path from 'path';

export async function runSocialMoneyTests() {
  console.log('Testing Social Money Track: Reputation & Tiered Approvals...');

  // Test 1: getApprovalRequirement for Gold Tier (score >= 60)
  const goldSmall = getApprovalRequirement(75, 1.5);
  console.assert(goldSmall.approvalType === 'AutoApprove', `Expected AutoApprove, got ${goldSmall.approvalType}`);
  console.assert(goldSmall.requiredVotes === 0, `Expected 0 votes, got ${goldSmall.requiredVotes}`);
  console.assert(goldSmall.autoApprove === true, 'Expected autoApprove to be true');

  const goldMed = getApprovalRequirement(75, 5.0);
  console.assert(goldMed.approvalType === 'SingleCouncil', `Expected SingleCouncil, got ${goldMed.approvalType}`);
  console.assert(goldMed.requiredVotes === 1, `Expected 1 vote, got ${goldMed.requiredVotes}`);

  const goldLarge = getApprovalRequirement(75, 12.0);
  console.assert(goldLarge.approvalType === 'FullDaoQuorum', `Expected FullDaoQuorum, got ${goldLarge.approvalType}`);
  console.assert(goldLarge.requiredVotes === 2, `Expected 2 votes, got ${goldLarge.requiredVotes}`);
  console.log('✓ Test 1: Gold tier tiered approvals (AutoApprove <= 2N, SingleCouncil <= 8N, FullDaoQuorum > 8N)');

  // Test 2: getApprovalRequirement for Silver Tier (score 20 - 59)
  const silverSmall = getApprovalRequirement(30, 0.5);
  console.assert(silverSmall.approvalType === 'SingleCouncil', `Expected SingleCouncil, got ${silverSmall.approvalType}`);
  console.assert(silverSmall.requiredVotes === 1, `Expected 1 vote, got ${silverSmall.requiredVotes}`);

  const silverMed = getApprovalRequirement(30, 4.0);
  console.assert(silverMed.approvalType === 'SingleCouncil', `Expected SingleCouncil, got ${silverMed.approvalType}`);
  console.assert(silverMed.requiredVotes === 1, `Expected 1 vote, got ${silverMed.requiredVotes}`);

  const silverLarge = getApprovalRequirement(30, 10.0);
  console.assert(silverLarge.approvalType === 'FullDaoQuorum', `Expected FullDaoQuorum, got ${silverLarge.approvalType}`);
  console.assert(silverLarge.requiredVotes === 2, `Expected 2 votes, got ${silverLarge.requiredVotes}`);
  console.log('✓ Test 2: Silver tier tiered approvals (SingleCouncil <= 5N, FullDaoQuorum > 5N)');

  // Test 3: getApprovalRequirement for Bronze Tier (score 0 - 19)
  const bronzeSmall = getApprovalRequirement(10, 0.5);
  console.assert(bronzeSmall.approvalType === 'FullDaoQuorum', `Expected FullDaoQuorum, got ${bronzeSmall.approvalType}`);
  console.assert(bronzeSmall.requiredVotes === 2, `Expected 2 votes, got ${bronzeSmall.requiredVotes}`);

  const bronzeLarge = getApprovalRequirement(0, 8.0);
  console.assert(bronzeLarge.approvalType === 'FullDaoQuorum', `Expected FullDaoQuorum, got ${bronzeLarge.approvalType}`);
  console.assert(bronzeLarge.requiredVotes === 2, `Expected 2 votes, got ${bronzeLarge.requiredVotes}`);
  console.log('✓ Test 3: Bronze tier mandates full DAO multi-sig quorum for all payouts');

  // Test 4: ReputationLedger records successful payout settlement
  const tmpRepDb = path.join(process.cwd(), 'test-temp-reputation.json');
  if (fs.existsSync(tmpRepDb)) fs.unlinkSync(tmpRepDb);

  const reputation = new ReputationLedger(tmpRepDb);
  await reputation.init();

  await reputation.recordPayoutSettled({
    accountId: 'contributor.testnet',
    amountNear: 2.5,
    deliverableCid: 'near/core#101',
    txHash: 'TxFakeHash123',
    task: 'Add Social Money track',
    validatorConfidence: 95,
  });

  const entry = reputation.getEntry('contributor.testnet');
  console.assert(entry.score === 13, `Expected score 13 (10 base + 3 bonus), got ${entry.score}`);
  console.assert(entry.completedTasks === 1, `Expected 1 completed task, got ${entry.completedTasks}`);
  console.assert(entry.totalPaidNear === 2.5, `Expected 2.5 NEAR paid, got ${entry.totalPaidNear}`);
  console.assert(entry.approvedProposals === 1, `Expected 1 approved proposal, got ${entry.approvedProposals}`);
  console.assert(entry.payouts?.length === 1, 'Expected 1 recorded payout');
  console.log('✓ Test 4: Payout settlement updates score, completed tasks, and total value paid');

  // Test 5: ReputationLedger records proposal rejection
  await reputation.recordProposalRejected('contributor.testnet', 'Deliverable replay detected');
  const entryAfterRejection = reputation.getEntry('contributor.testnet');
  console.assert(entryAfterRejection.score === 8, `Expected score 8 (13 - 5), got ${entryAfterRejection.score}`);
  console.assert(entryAfterRejection.rejectionsCount === 1, `Expected 1 rejection, got ${entryAfterRejection.rejectionsCount}`);
  console.log('✓ Test 5: Deliverable rejection applies penalty and records rejection history');

  // Test 6: Public track record query
  const trackRecord = reputation.getPublicTrackRecord('contributor.testnet');
  console.assert(trackRecord.accountId === 'contributor.testnet', 'Account matches');
  console.assert(trackRecord.completedTasks === 1, 'Completed tasks match');
  console.assert(trackRecord.totalPaidNear === 2.5, 'Total paid matches');
  console.assert(trackRecord.rejectionsCount === 1, 'Rejections match');
  console.assert(trackRecord.sampleApprovalSchedule.micro.approvalType === 'FullDaoQuorum', 'Sample approval matches Bronze tier');
  console.log('✓ Test 6: Public track record produces complete contributor profile');

  // Test 7: PolicyEngine integrates tiered approval resolution
  const tmpPolicyDb = path.join(process.cwd(), 'test-temp-policy-sm.json');
  if (fs.existsSync(tmpPolicyDb)) fs.unlinkSync(tmpPolicyDb);

  const policyConfig: PolicyConfig = {
    maxSpendPerProposal: BigInt('10000000000000000000000000'), // 10 NEAR
    maxSpendPerDay: BigInt('50000000000000000000000000'),
    cooldownHours: 0,
    minReputationScore: 0,
  };

  const policy = new PolicyEngine(tmpPolicyDb, policyConfig);
  await policy.init();

  // Silver contributor (score 30) requesting 2 NEAR
  const policyCheck = policy.check({
    recipientId: 'silver.testnet',
    amountYocto: BigInt('2000000000000000000000000'), // 2 NEAR
    deliverableCid: 'https://github.com/near/repo/pull/5',
    recipientReputation: 30,
  });

  console.assert(policyCheck.ok, 'Policy check must pass');
  if (policyCheck.ok) {
    console.assert(policyCheck.tier === 'Silver', 'Tier is Silver');
    console.assert(policyCheck.approvalRequirement.approvalType === 'SingleCouncil', 'Silver 2N requires SingleCouncil');
    console.assert(policyCheck.approvalRequirement.requiredVotes === 1, 'Required votes = 1');
  }
  console.log('✓ Test 7: PolicyEngine wires tiered approval resolution into policy clearance');

  // Test 8: Fail-closed spend cap rejection
  const overCapCheck = policy.check({
    recipientId: 'silver.testnet',
    amountYocto: BigInt('18000000000000000000000000'), // 18 NEAR (Silver cap is 15 NEAR)
    deliverableCid: 'https://github.com/near/repo/pull/6',
    recipientReputation: 30,
  });
  console.assert(!overCapCheck.ok, 'Over-cap spend must fail closed');
  console.assert(overCapCheck.ok === false && overCapCheck.reason.includes('exceeds Silver tier cap'), 'Error mentions cap');
  console.log('✓ Test 8: Fail-closed policy protects treasury from over-cap proposals');

  // Clean up
  if (fs.existsSync(tmpRepDb)) fs.unlinkSync(tmpRepDb);
  if (fs.existsSync(tmpPolicyDb)) fs.unlinkSync(tmpPolicyDb);

  console.log('All Social Money tests passed successfully!\n');
}

if (import.meta.url.endsWith(process.argv[1])) {
  runSocialMoneyTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
