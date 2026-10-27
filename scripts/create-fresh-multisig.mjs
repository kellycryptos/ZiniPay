import { connect, KeyPair, keyStores, utils } from 'near-api-js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), 'agent', '.env');
dotenv.config({ path: envPath });

const networkId = 'testnet';
const nodeUrl = 'https://rpc.testnet.near.org';
const faucetUrl = 'https://helper.testnet.near.org/account';

async function checkAccountExists(accountId) {
  try {
    const res = await axios.post(nodeUrl, {
      jsonrpc: '2.0',
      id: '1',
      method: 'query',
      params: { request_type: 'view_account', finality: 'final', account_id: accountId }
    }, { timeout: 10000 });
    return !res.data.error;
  } catch (e) {
    return false;
  }
}

async function createFaucetAccount(accountId, keyPair, maxRetries = 3) {
  const exists = await checkAccountExists(accountId);
  if (exists) {
    console.log(`ℹ Account ${accountId} already exists on testnet.`);
    return true;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Creating testnet account via faucet: ${accountId}...`);
      const res = await axios.post(faucetUrl, {
        newAccountId: accountId,
        newAccountPublicKey: keyPair.publicKey.toString(),
      }, { timeout: 30000 });

      if (res.status === 200) {
        console.log(`✓ ${accountId} successfully funded with 10 testnet NEAR! (Tx: ${res.data.transaction?.hash || 'confirmed'})`);
        return true;
      }
    } catch (e) {
      console.warn(`  Warning on attempt ${attempt}: ${e.response?.status || e.message}`);
      if (attempt < maxRetries) {
        console.log(`  Waiting 5 seconds before retry...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw new Error(`Failed to create account ${accountId} after ${maxRetries} attempts.`);
}

async function main() {
  console.log('\n=== Creating Fresh Multi-Sig Testnet Cluster ===\n');

  const c1Kp = KeyPair.fromRandom('ed25519');
  const c2Kp = KeyPair.fromRandom('ed25519');
  const recKp = KeyPair.fromRandom('ed25519');
  const polKp = KeyPair.fromRandom('ed25519');

  const c1Id = 'zinipay-c1.testnet';
  const c2Id = 'zinipay-c2.testnet';
  const recId = 'zinipay-recipient2.testnet';
  const polId = 'zinipay-policy2.testnet';

  // 1. Create accounts via faucet
  await createFaucetAccount(c1Id, c1Kp);
  await new Promise(r => setTimeout(r, 2000));
  await createFaucetAccount(c2Id, c2Kp);
  await new Promise(r => setTimeout(r, 2000));
  await createFaucetAccount(recId, recKp);
  await new Promise(r => setTimeout(r, 2000));
  await createFaucetAccount(polId, polKp);

  // 2. Connect Council 1 to deploy Sputnik DAO
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(networkId, c1Id, c1Kp);
  await keyStore.setKey(networkId, c2Id, c2Kp);
  await keyStore.setKey(networkId, polId, polKp);

  const near = await connect({ networkId, keyStore, nodeUrl });
  const c1Account = await near.account(c1Id);

  const daoName = 'zinipay-demo';
  const daoContractId = `${daoName}.sputnikv2.testnet`;
  console.log(`\nCreating Sputnik DAO ${daoContractId} with multi-sig council [${c1Id}, ${c2Id}]...`);

  const daoExists = await checkAccountExists(daoContractId);
  if (!daoExists) {
    const rawArgs = {
      config: {
        name: daoName,
        purpose: 'ZiniPay Multi-Sig Human Treasury',
        metadata: '',
      },
      policy: [
        c1Id,
        c2Id,
      ],
    };

    const encodedArgs = Buffer.from(JSON.stringify(rawArgs)).toString('base64');

    const createTx = await c1Account.functionCall({
      contractId: 'sputnikv2.testnet',
      methodName: 'create',
      args: {
        name: daoName,
        args: encodedArgs,
      },
      gas: BigInt('300000000000000'),
      attachedDeposit: BigInt('6000000000000000000000000'), // 6 NEAR
    });

    console.log(`✓ Sputnik DAO creation confirmed on-chain!`);
    console.log(`  Tx Hash: ${createTx.transaction.hash}`);
    console.log(`  Explorer: https://testnet.nearblocks.io/txns/${createTx.transaction.hash}`);
  } else {
    console.log(`ℹ Sputnik DAO ${daoContractId} already exists.`);
  }

  // 3. Verify DAO policy on-chain
  const daoPolicy = await c1Account.viewFunction({
    contractId: daoContractId,
    methodName: 'get_policy',
    args: {},
  });

  console.log(`\nVerified On-Chain DAO Policy:`);
  console.log(`  Proposal bond: ${utils.format.formatNearAmount(daoPolicy.proposal_bond, 2)} NEAR`);
  console.log(`  Council roles:`, JSON.stringify(daoPolicy.roles.find(r => r.name === 'council'), null, 2));

  // 4. Update agent/.env
  let envContent = fs.readFileSync(envPath, 'utf-8');
  const updates = {
    COUNCIL_ACCOUNT_ID: c1Id,
    COUNCIL_PRIVATE_KEY: c1Kp.toString(),
    COUNCIL2_ACCOUNT_ID: c2Id,
    COUNCIL2_PRIVATE_KEY: c2Kp.toString(),
    RECIPIENT_ACCOUNT_ID: recId,
    RECIPIENT_PRIVATE_KEY: recKp.toString(),
    DAO_CONTRACT_ID: daoContractId,
    POLICY_CONTRACT_ID: polId,
    POLICY_PRIVATE_KEY: polKp.toString(),
  };

  for (const [k, v] of Object.entries(updates)) {
    const regex = new RegExp(`^${k}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${k}=${v}`);
    } else {
      envContent += `\n${k}=${v}`;
    }
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log(`\n✓ agent/.env updated with fresh multi-sig credentials.`);
  console.log(`  Agent: agentzinipaytestnet.testnet (Proposer only, zero council/DAO ownership)`);
  console.log(`  Council 1: ${c1Id}`);
  console.log(`  Council 2: ${c2Id}`);
  console.log(`  Recipient: ${recId}`);
  console.log(`  Policy Account: ${polId}`);
  console.log(`  DAO: ${daoContractId}`);
}

main().catch((err) => {
  console.error('❌ Error during setup:', err);
  process.exit(1);
});
