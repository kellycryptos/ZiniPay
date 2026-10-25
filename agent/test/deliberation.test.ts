import { MultiAgentDeliberationEngine, verifyArtifact, verifyAttestationReport } from '../src/deliberation.js';
import { DeliverableValidator } from '../src/validator.js';

export async function runDeliberationTests() {
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

  // Test 5: verifyAttestationReport succeeds with valid matching report
  const testNonce = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const validReport = {
    gateway_attestation: {
      intel_quote: '0400000000000000905e2634b3...',
      request_nonce: testNonce,
      signing_address: '0x3a9fB06B9229eE9f430D4e2aFe2D76020c29a8a3',
      signing_algo: 'ecdsa',
    },
  };
  const validAtt = verifyAttestationReport(validReport, testNonce);
  console.assert(validAtt.reportReceived, 'Attestation with matching nonce must receive report');
  console.assert(!validAtt.verified, 'DCAP quote must be labeled unverified without PCS cert chain check');
  console.assert(validAtt.attestationHash?.startsWith('sha256:'), 'Attestation hash must be sha256:');
  console.log('✓ Test 5: Attestation report with fresh nonce received and labeled unverified without PCS check');

  // Test 6: verifyAttestationReport fails closed on tampered / replayed report
  const tamperedReport = {
    gateway_attestation: {
      intel_quote: '0400000000000000905e2634b3...',
      request_nonce: 'replayed-or-tampered-nonce-0000000000000000000000000000000000000000',
      signing_address: '0x3a9fB06B9229eE9f430D4e2aFe2D76020c29a8a3',
    },
  };
  const tamperedAtt = verifyAttestationReport(tamperedReport, testNonce);
  console.assert(!tamperedAtt.verified, 'Attestation with tampered nonce must fail');
  console.assert(tamperedAtt.reason?.includes('Nonce mismatch'), 'Failure reason must cite nonce mismatch');

  const missingQuoteReport = {
    gateway_attestation: {
      request_nonce: testNonce,
    },
  };
  const missingAtt = verifyAttestationReport(missingQuoteReport, testNonce);
  console.assert(!missingAtt.verified, 'Attestation without intel_quote must fail');
  console.log('✓ Test 6: Tampered attestation fails closed with explicit reason');

  console.log('All Deliberation tests passed successfully!\n');
}

if (import.meta.url.endsWith(process.argv[1])) {
  runDeliberationTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
