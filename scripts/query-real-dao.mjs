// scripts/query-real-dao.mjs
import axios from 'axios';

async function queryDao(daoId) {
  const rpcUrl = 'https://rpc.testnet.near.org';
  console.log(`Querying ${daoId}...`);

  try {
    // 1. Get Policy
    const polRes = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'zinipay-policy',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: daoId,
        method_name: 'get_policy',
        args_base64: 'e30=',
      },
    });

    if (polRes.data.result?.result) {
      const polDecoded = new TextDecoder().decode(new Uint8Array(polRes.data.result.result));
      const policy = JSON.parse(polDecoded);
      console.log(`✓ DAO Policy retrieved:`);
      console.log(`  Roles:`, policy.roles?.map(r => r.name));
      console.log(`  Proposal bond:`, (BigInt(policy.proposal_bond || '0') / 10n**24n).toString(), 'NEAR');
      console.log(`  Proposal period:`, (Number(policy.proposal_period || '0') / 1e9 / 3600).toFixed(1), 'hours');
    }

    // 2. Get Proposals
    const propRes = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'zinipay-proposals',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: daoId,
        method_name: 'get_proposals',
        args_base64: Buffer.from(JSON.stringify({ from_index: 0, limit: 5 })).toString('base64'),
      },
    });

    if (propRes.data.result?.result) {
      const propDecoded = new TextDecoder().decode(new Uint8Array(propRes.data.result.result));
      const proposals = JSON.parse(propDecoded);
      console.log(`✓ Retrieved ${proposals.length} live proposals from ${daoId}:`);
      for (const p of proposals) {
        console.log(`  - #${p.id} by ${p.proposer}: ${p.description?.substring(0, 60)}... [Status: ${p.status}]`);
      }
    }
  } catch (err) {
    console.error(`Error querying ${daoId}:`, err.message);
  }
}

async function run() {
  await queryDao('genesis.sputnikv2.testnet');
}

run();
