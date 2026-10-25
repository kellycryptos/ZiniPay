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
    console.log('✓ Test 1: Received live quote from 1Click API:');
    console.log(`  Amount Out: ${quote.amountOutFormatted ?? quote.amountOut} USDC`);
    console.log(`  Correlation ID: ${quote.correlationId}`);
    console.log(`  Estimated Time: ${quote.estimatedTimeSeconds}s`);
    console.assert(Number(quote.amountOut) > 0, 'Amount out must be positive');
  } catch (err: any) {
    console.error('Live quote request failed:', err.response?.data || err.message);
    throw err;
  }

  // Test 2: Live status check
  // Using an existing deposit address to test real status query
  const testDepositAddr = '3a0a1a39071d390182705510c9fdada02b3c377f9c4a4a5996e808937633ec48';
  console.log(`\nQuerying live status for depositAddress ${testDepositAddr.slice(0, 10)}...`);
  try {
    const status = await intents.getStatus(testDepositAddr);
    console.log(`✓ Test 2: Live status check succeeded. Status: ${status.status} (Terminal: ${status.isTerminal})`);
    console.assert(status.status !== 'UNKNOWN', 'Status must not be UNKNOWN');
  } catch (err: any) {
    console.error('Status query failed:', err.response?.data || err.message);
    throw err;
  }

  console.log('All NEAR Intents live tests passed successfully!\n');
}

if (import.meta.url.endsWith(process.argv[1])) {
  runIntentsLiveTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
