#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { createPrivateKey, createPublicKey, sign } from 'node:crypto';
import { createRequire } from 'node:module';
import { approveRoute } from './approve-route.mjs';
const { readSignedPolicy } = createRequire(import.meta.url)('../../ai-gateway/lib/routing-policy.js');

// Trusted CI/evaluation worker ONLY. Signing key is supplied externally; never generated, logged or stored in Git.
// Input: {manifest: {...profiles}, evaluations: [{profileId, policy, evidence, route, apiCostEvidence?}]}.
export function publishRoutingPolicy(input, privateKey, now = Date.now()) {
  if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('ED25519_REQUIRED');
  const manifest = structuredClone(input.manifest);
  for (const p of manifest.profiles) {
    const evaluations = input.evaluations.filter(e => e.profileId === p.id);
    if (!evaluations.length) throw new Error('MISSING_EVALUATION');
    p.routes = evaluations.map(e => approveRoute({ ...e, now }));
  }
  const payload = JSON.stringify(manifest);
  const envelope = { payload, signature: sign(null, Buffer.from(payload), privateKey).toString('base64') };
  readSignedPolicy(envelope, createPublicKey(privateKey), now);
  return envelope;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [inputFile, keyFile, outputFile, ...extra] = process.argv.slice(2);
  try {
    if (!inputFile || !keyFile || !outputFile || extra.length) throw new Error('INVALID_ARGUMENTS');
    const input = JSON.parse(await readFile(inputFile, 'utf8'));
    const key = createPrivateKey(await readFile(keyFile));
    const envelope = publishRoutingPolicy(input, key);
    await writeFile(outputFile, JSON.stringify(envelope), { flag: 'wx', mode: 0o600 });
    console.log('SIGNED_POLICY_WRITTEN');
  } catch {
    console.error('POLICY_PUBLICATION_BLOCKED'); process.exitCode = 1;
  }
}
