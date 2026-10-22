// scripts/test-near-rpc.mjs
import axios from 'axios';

async function testRpc() {
  const rpcUrl = 'https://rpc.testnet.near.org';
  console.log('Testing NEAR Testnet RPC connectivity...');

  try {
    const statusRes = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'zinipay-status',
      method: 'status',
      params: [],
    });

    console.log('✓ NEAR Testnet RPC is online!');
    console.log(`Chain ID: ${statusRes.data.result.chain_id}`);
    console.log(`Latest Protocol Version: ${statusRes.data.result.protocol_version}`);
    console.log(`Latest Block Height: ${statusRes.data.result.sync_info.latest_block_height}`);

    // Test querying a Sputnik DAO on testnet
    const daoRes = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'zinipay-dao-query',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: 'sputnikdao2.testnet',
      },
    });

    if (daoRes.data.result) {
      console.log('✓ Sputnik DAO v2 Factory (sputnikdao2.testnet) is active on Testnet!');
    }
  } catch (error) {
    console.error('RPC Test error:', error.message);
  }
}

testRpc();
