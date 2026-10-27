import { connect, KeyPair, keyStores, utils } from 'near-api-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'agent', '.env') });

const networkId = process.env.NEAR_NETWORK || 'testnet';
const nodeUrl = 'https://rpc.testnet.near.org';
const accountId = process.env.AGENT_ACCOUNT_ID || 'agentzinipaytestnet.testnet';
const privateKey = process.env.AGENT_PRIVATE_KEY;

if (!privateKey) {
  console.error('No AGENT_PRIVATE_KEY in agent/.env');
  process.exit(1);
}

async function createDao() {
  console.log(`Connecting ${accountId} to ${networkId}...`);
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey);
  await keyStore.setKey(networkId, accountId, keyPair);

  const near = await connect({ networkId, keyStore, nodeUrl });
  const account = await near.account(accountId);
  const bal = await account.getAccountBalance();
  console.log(`Current Balance: ${utils.format.formatNearAmount(bal.available, 4)} NEAR`);

  const daoName = 'zinipay';
  const targetDaoId = `${daoName}.sputnikv2.testnet`;
  console.log(`Creating Sputnik DAO: ${targetDaoId}...`);

  const rawArgs = {
    config: {
      name: daoName,
      purpose: 'ZiniPay Constrained Agent Layer Treasury',
      metadata: ''
    },
    policy: [
      accountId // Set agentzinipaytestnet.testnet as the initial council member
    ]
  };

  const encodedArgs = Buffer.from(JSON.stringify(rawArgs)).toString('base64');

  const result = await account.functionCall({
    contractId: 'sputnikv2.testnet',
    methodName: 'create',
    args: {
      name: daoName,
      args: encodedArgs,
    },
    gas: BigInt('300000000000000'), // 300 TGas
    attachedDeposit: BigInt('6000000000000000000000000'), // 6 NEAR
  });

  console.log('✓ DAO creation transaction succeeded!');
  console.log('Tx Hash:', result.transaction.hash);
  console.log(`Explorer link: https://testnet.nearblocks.io/txns/${result.transaction.hash}`);
  console.log(`Target DAO ID: ${targetDaoId}`);
}

createDao().catch((err) => {
  console.error('Error creating DAO:', err);
  process.exit(1);
});
