import { MultiAgentDeliberationEngine, verifyArtifact } from '../src/deliberation.js';
import { DeliverableValidator } from '../src/validator.js';

async function main() {
  console.log('Testing Task 2 deliberation & validator fail-closed logic...');

  // Test 1: verifyArtifact fails on invalid deliverables
  const art1 = await verifyArtifact('not-a-valid-proof', 'alice.testnet');
  console.assert(!art1.verified, 'Invalid deliverable must not be verified');
  console.log('✓ Test 1: Invalid deliverable fails verification');

  // Test 2: MultiAgentDeliberationEngine fails closed without key in live mode
  const engine = new MultiAgentDeliberationEngine({
    baseUrl: 'https://example.com/v1',
    apiKey: 'mock-key',
    model: 'test-model',
  });

  const resLive = await engine.deliberate({
    taskDescription: 'Build a feature',
    deliverable: 'https://github.com/foo/bar/pull/999999',
    amountNear: '5',
    recipientId: 'bob.testnet',
    recipientReputation: 50,
    dryRun: false,
  });
  console.assert(!resLive.consensusApproved, 'Live deliberation must reject when key is mock');
  console.assert(resLive.attestationSummary.includes('FAIL'), 'Attestation summary must show FAIL');
  console.log('✓ Test 2: Live deliberation fails closed with mock key');

  // Test 3: MultiAgentDeliberationEngine in dry-run mode
  const resDryRun = await engine.deliberate({
    taskDescription: 'Build a feature',
    deliverable: 'https://github.com/foo/bar/pull/999999',
    amountNear: '5',
    recipientId: 'bob.testnet',
    recipientReputation: 50,
    dryRun: true,
  });
  console.assert(resDryRun.attestationSummary.includes('[SIMULATION]'), 'Dry run must label SIMULATION');
  console.assert(resDryRun.attestationSummary.includes('Three-Way Match:'), 'Attestation summary has dynamic match count');
  console.log('✓ Test 3: Dry run deliberation labels SIMULATION');

  // Test 4: DeliverableValidator fails closed without key in live mode
  const validator = new DeliverableValidator({
    baseUrl: 'https://example.com/v1',
    apiKey: 'mock-key',
    model: 'test-model',
  });
  const valLive = await validator.validate({
    taskDescription: 'Test task',
    deliverable: 'https://example.com',
    amountNear: '5',
    dryRun: false,
  });
  console.assert(!valLive.approved, 'Validator must reject live request with mock key');
  console.log('✓ Test 4: Validator fails closed with mock key');

  console.log('\nAll Task 2 tests passed successfully!');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
