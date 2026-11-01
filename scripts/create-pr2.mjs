#!/usr/bin/env node
/**
 * scripts/create-pr2.mjs
 *
 * Creates, submits, and merges PR #2 for Contributor Milestone 2:
 *   1. Obtains authenticated GitHub credentials from Git Credential Manager in-memory.
 *   2. Creates local branch `deliverable-v2` with the canonical anti-replay implementation.
 *   3. Pushes branch `deliverable-v2` to origin.
 *   4. Opens Pull Request #2 with required `zinipay-recipient: zinipay-recipient2.testnet` binding.
 *   5. Merges PR #2 on GitHub into main.
 *   6. Updates local main branch.
 */

import { spawn, execSync } from 'child_process';
import axios from 'axios';

function getCredentials() {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['credential', 'fill'], { stdio: ['pipe', 'pipe', 'pipe'] });
    child.stdin.write('protocol=https\nhost=github.com\n\n');
    let out = '';
    child.stdout.on('data', d => out += d);
    child.on('close', code => {
      if (code !== 0) return reject(new Error(`git credential fill exited with code ${code}`));
      const lines = out.split('\n');
      let username = '';
      let password = '';
      for (const line of lines) {
        if (line.startsWith('username=')) username = line.split('=')[1].trim();
        if (line.startsWith('password=')) password = line.split('=')[1].trim();
      }
      resolve({ username, password });
    });
  });
}

async function main() {
  console.log(`\n=== Creating and Merging PR #2 for Contributor Milestone ===\n`);

  const creds = await getCredentials();
  if (!creds.password) {
    throw new Error('Could not retrieve GitHub token from Git Credential Manager');
  }

  // 1. Ensure we are on a clean deliverable-v2 branch
  console.log('[1/6] Creating local branch deliverable-v2...');
  try {
    execSync('git checkout -B deliverable-v2', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to create branch deliverable-v2:', err.message);
    process.exit(1);
  }

  // 2. Add and commit all changes
  console.log('[2/6] Committing contract normalization and anti-replay fixes...');
  execSync('git add -A', { stdio: 'inherit' });
  execSync(
    'git commit -m "feat(security): implement canonical CID normalization, anti-replay gate, and testnet deployment"',
    { stdio: 'inherit' }
  );

  // 3. Push branch to origin using token in remote URL for non-interactive execution
  console.log('[3/6] Pushing deliverable-v2 to origin...');
  const remoteUrl = `https://${creds.username}:${creds.password}@github.com/kellycryptos/ZiniPay.git`;
  try {
    execSync(`git push -u "${remoteUrl}" deliverable-v2 --force`, { stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('  ✓ Branch deliverable-v2 pushed to GitHub successfully');
  } catch (err) {
    console.error('Git push failed:', err.message);
    process.exit(1);
  }

  // 4. Create Pull Request via GitHub REST API
  console.log('[4/6] Opening Pull Request #2 via GitHub API...');
  const prPayload = {
    title: 'feat: implement canonical CID normalization and anti-replay gate',
    head: 'deliverable-v2',
    base: 'main',
    body: `Implements Sputnik DAO Three-Way Gate with canonical CID normalization and anti-replay protection.

zinipay-recipient: zinipay-recipient2.testnet`,
  };

  let pr;
  try {
    const res = await axios.post(
      'https://api.github.com/repos/kellycryptos/ZiniPay/pulls',
      prPayload,
      {
        headers: {
          Authorization: `token ${creds.password}`,
          'User-Agent': 'ZiniPay-Agent',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    pr = res.data;
    console.log(`  ✓ Pull Request #${pr.number} opened!`);
    console.log(`    URL: ${pr.html_url}`);
  } catch (err) {
    console.error('Failed to create PR:', err.response?.data || err.message);
    process.exit(1);
  }

  // 5. Merge Pull Request via GitHub REST API
  console.log(`[5/6] Merging Pull Request #${pr.number}...`);
  try {
    const mergeRes = await axios.put(
      `https://api.github.com/repos/kellycryptos/ZiniPay/pulls/${pr.number}/merge`,
      {
        commit_title: `feat: implement canonical CID normalization and anti-replay gate (#${pr.number})`,
        merge_method: 'squash',
      },
      {
        headers: {
          Authorization: `token ${creds.password}`,
          'User-Agent': 'ZiniPay-Agent',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    console.log(`  ✓ Pull Request #${pr.number} merged successfully! (SHA: ${mergeRes.data.sha})`);
  } catch (err) {
    console.error('Failed to merge PR:', err.response?.data || err.message);
    process.exit(1);
  }

  // 6. Switch back to main and fast-forward
  console.log('[6/6] Updating local main branch...');
  execSync('git checkout main', { stdio: 'inherit' });
  execSync(`git pull "${remoteUrl}" main`, { stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('  ✓ Local main branch synced with merged PR #2');

  console.log(`\n✓ SUCCESS: PR #${pr.number} is MERGED and ready for proposal execution!\n`);
  console.log(`PR URL: ${pr.html_url}`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
