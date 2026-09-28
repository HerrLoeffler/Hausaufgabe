import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const expected = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (expected.project !== 'hausaufgabe-staging') throw new Error('Staging verification only.');

const origin = 'https://hausaufgabe-staging.web.app';
const assets = Object.keys(expected.files);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function remoteHash(name, attempt) {
  const cacheBust = `${expected.commit}-${attempt}-${Date.now()}`;
  const response = await fetch(`${origin}/${name}?release=${encodeURIComponent(cacheBust)}`, {
    signal: AbortSignal.timeout(25000),
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
}

async function waitForAsset(name) {
  const wanted = expected.files[name];
  if (!wanted) throw new Error(`Release manifest has no hash for ${name}.`);

  let lastHash = '';
  let lastError = null;
  const attempts = 12;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      lastHash = await remoteHash(name, attempt);
      if (lastHash === wanted) return;
      lastError = null;
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      const waitMs = Math.min(5000, 750 + attempt * 350);
      console.log(`Warte auf Staging-Propagation: ${name} (${attempt}/${attempts}) …`);
      await sleep(waitMs);
    }
  }

  if (lastError) throw lastError;
  throw new Error(`Staging still serves a different version of ${name} after waiting for propagation.`);
}

for (const name of assets) await waitForAsset(name);
console.log(`Remote assets match ${expected.version} (${expected.commit.slice(0, 8)}).`);

