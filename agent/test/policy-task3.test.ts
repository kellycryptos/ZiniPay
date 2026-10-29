import { normalizeDeliverable, PolicyEngine, type PolicyConfig } from '../src/policy.js';
import { SputnikDAO } from '../src/dao.js';
import fs from 'fs';
import path from 'path';

export async function runPolicyTests() {
  console.log('Testing Task 3 policy normalization, anti-replay, and FunctionCall proposal...');

  // Test 1: normalizeDeliverable canonicalization
  const pr1 = 'https://GitHub.com/Near/repo-contracts/pull/42?foo=bar#section';
  const pr2 = 'https://github.com/near/repo-contracts/pull/42/';
  const normPr1 = normalizeDeliverable(pr1);
  const normPr2 = normalizeDeliverable(pr2);
  console.assert(normPr1 === 'near/repo-contracts#42', `Expected near/repo-contracts#42, got ${normPr1}`);
  console.assert(normPr2 === 'near/repo-contracts#42', `Expected near/repo-contracts#42, got ${normPr2}`);
  console.log('✓ Test 1: GitHub PR canonicalized to owner/repo#number');

  // Test 2: IPFS canonicalization
  const ipfs1 = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/path?query=1';
  const normIpfs = normalizeDeliverable(ipfs1);
  console.assert(normIpfs === 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', 'IPFS CID canonicalized');
  console.log('✓ Test 2: IPFS CID canonicalized');

  // Test 3: Anti-replay across equivalent URLs
  const tmpDb = path.join(process.cwd(), 'test-temp-policy.json');
  if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);

  const config: PolicyConfig = {
    maxSpendPerProposal: BigInt('10000000000000000000000000'), // 10 NEAR
    maxSpendPerDay: BigInt('50000000000000000000000000'),
    cooldownHours: 0,
    minReputationScore: 0,
  };

  const policy = new PolicyEngine(tmpDb, config);
  await policy.init();

  // First check passes
  const check1 = policy.check({
    recipientId: 'alice.testnet',
    amountYocto: BigInt('1000000000000000000000000'), // 1 NEAR
    deliverableCid: pr1,
    recipientReputation: 10,
  });
  console.assert(check1.ok, 'Initial check must pass');

  // Record proposal with pr1
  await policy.recordProposal({
    daoProposalId: 101,
    recipientId: 'alice.testnet',
    amountYocto: BigInt('1000000000000000000000000'),
    deliverableCid: pr1,
    tier: 'Bronze',
  });

  // Second check with pr2 (different format of same PR) MUST fail anti-replay
  const check2 = policy.check({
    recipientId: 'bob.testnet',
    amountYocto: BigInt('1000000000000000000000000'),
    deliverableCid: pr2,
    recipientReputation: 10,
  });
  console.assert(!check2.ok, 'Replay attempt must be blocked');
  console.assert(check2.ok === false && check2.reason.includes('already been settled'), 'Error must mention replay');
  console.log('✓ Test 3: Anti-replay blocks equivalent deliverable');

  // Test 4: SputnikDAO.buildPolicyReleaseProposal
  const prop = SputnikDAO.buildPolicyReleaseProposal({
    policyContractId: 'policy.testnet',
    recipientId: 'alice.testnet',
    amountYocto: '5000000000000000000000000',
    cid: normPr1,
  });
  console.assert('FunctionCall' in prop, 'Proposal must be FunctionCall');
  if ('FunctionCall' in prop) {
    console.assert(prop.FunctionCall.receiver_id === 'policy.testnet', 'Receiver must be policy contract');
    console.assert(prop.FunctionCall.actions[0].method_name === 'release', 'Action must be release');
    const argsJson = JSON.parse(Buffer.from(prop.FunctionCall.actions[0].args, 'base64').toString());
    console.assert(argsJson.recipient === 'alice.testnet', 'Arg recipient matches');
    console.assert(argsJson.cid === 'near/repo-contracts#42', 'Arg cid matches normalized deliverable');
  }
  console.log('✓ Test 4: FunctionCall proposal built correctly');

  // Cleanup
  if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);

  console.log('All Policy tests passed successfully!\n');
}

if (import.meta.url.endsWith(process.argv[1])) {
  runPolicyTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
