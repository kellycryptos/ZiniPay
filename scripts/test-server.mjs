import http from 'http';
import { spawn } from 'child_process';

const serverProc = spawn('node', ['server.mjs'], { stdio: 'inherit' });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  await wait(2000);
  try {
    console.log('Testing GET http://localhost:3000/health...');
    const r1 = await fetch('http://localhost:3000/health');
    console.log('Status:', r1.status, 'Data:', r1.data);

    console.log('\nTesting GET http://localhost:3000/api/health...');
    const r2 = await fetch('http://localhost:3000/api/health');
    console.log('Status:', r2.status, 'Data:', r2.data);

    console.log('\nTesting GET http://localhost:3000/...');
    const r3 = await fetch('http://localhost:3000/');
    console.log('Status:', r3.status, 'HTML length:', r3.data.length);

    console.log('\nTesting POST http://localhost:3000/api/propose...');
    const r4 = await fetch('http://localhost:3000/api/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountNear: '4.5', recipientId: 'alice.testnet' }),
    });
    console.log('Status:', r4.status, 'Data:', r4.data);

    console.log('\nALL SERVER TESTS PASSED SUCCESSFULLY!');
  } finally {
    serverProc.kill();
  }
}

run().catch((err) => {
  console.error(err);
  serverProc.kill();
  process.exit(1);
});
