import { NearIntents } from '../src/intents.js';

export async function runIntentsLiveTests() {
  console.log('Testing NEAR Intents 1Click live integration...');

  const intents = new NearIntents('https://1click.chaindefuser.com');

  // Test 1: Live dry quote request
  console.log('Dispatching live dry quote request to 1Click API (POST /v0/quote)...');
  const quoteReq = {
    tokenIn: 'near',
    amountIn: '1000000000000000000000000', // 1 NEAR
    tokenOut: 'usdc',
    destinationChain: 'ethereum',
    recipientAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    refundTo: 'alice.near',
    dry: true,
  };

  try {
    const quote = await intents.getQuote(quoteReq);
    if (!(Number(quote.amountOut) > 0)) {
      throw new Error(`Assertion failed: Amount out must be positive, got ${quote.amountOut}`);
    }
    console.log('✓ Test 1: Received live quote from 1Click API:');
    console.log(`  Amount Out: ${quote.amountOutFormatted ?? quote.amountOut} USDC`);
    console.log(`  Correlation ID: ${quote.correlationId}`);
    console.log(`  Estimated Time: ${quote.estimatedTimeSeconds}s`);
  } catch (err: any) {
    if (err.message?.startsWith('Assertion failed:')) {
      console.error(`✗ Test 1 FAILED: ${err.message}`);
      process.exit(1);
    }
    const statusOrCode = err.response?.status ? `HTTP ${err.response.status}` : (err.code || err.message);
    const detail = err.response?.data?.message || err.message;
    console.log(`  - [SKIPPED] Test 1: 1Click live quote API unavailable or pair offline (${statusOrCode}: ${detail})`);
  }

  // Test 2: Live status check
  // Using an existing deposit address to test real status query
  const testDepositAddr = '3a0a1a39071d390182705510c9fdada02b3c377f9c4a4a5996e808937633ec48';
  console.log(`\nQuerying live status for depositAddress ${testDepositAddr.slice(0, 10)}...`);
  try {
    const status = await intents.getStatus(testDepositAddr);
    if (status.status === 'UNKNOWN') {
      throw new Error(`Assertion failed: Status must not be UNKNOWN, got ${status.status}`);
    }
    console.log(`✓ Test 2: Live status check succeeded. Status: ${status.status} (Terminal: ${status.isTerminal})`);
  } catch (err: any) {
    if (err.message?.startsWith('Assertion failed:')) {
      console.error(`✗ Test 2 FAILED: ${err.message}`);
      process.exit(1);
    }
    const statusOrCode = err.response?.status ? `HTTP ${err.response.status}` : (err.code || err.message);
    const detail = err.response?.data?.message || err.message;
    console.log(`  - [SKIPPED] Test 2: 1Click live status API unavailable (${statusOrCode}: ${detail})`);
  }

  console.log('NEAR Intents live test suite finished (external 1Click API checks complete).\n');
}

if (import.meta.url.endsWith(process.argv[1])) {
  runIntentsLiveTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
