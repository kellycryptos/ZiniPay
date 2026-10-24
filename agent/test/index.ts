import { runDeliberationTests } from './deliberation.test.js';
import { runPolicyTests } from './policy-task3.test.js';

async function main() {
  console.log('--- Suite 1: Deliberation & Validator ---');
  await runDeliberationTests();

  console.log('--- Suite 2: Policy Normalization & Anti-Replay ---');
  await runPolicyTests();

  console.log('All agent tests completed successfully!');
}

main().catch((err) => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});
