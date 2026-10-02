'use strict';
const { readFileSync } = require('node:fs');
const { createPublicKey } = require('node:crypto');
const { readSignedPolicy, fail } = require('./routing-policy');
const { createRoutingStore } = require('./routing-store');
const { createOrchestrator } = require('./orchestrator');
const { summarizeRouting } = require('./routing-statistics');

function createAutomaticRuntime({ env = process.env, providers, db, validators }) {
  if (env.GC_AUTOMATIC_ROUTING !== 'true') return null;
  if (env.GCLOUD_PROJECT !== 'hausaufgabe-staging') fail('STAGING_PROJECT_REQUIRED');
  if (!env.GC_ROUTING_POLICY_FILE || !env.GC_ROUTING_PUBLIC_KEY_FILE || !db || !validators) fail('MISSING_ROUTING_DEPENDENCY');
  const publicKey = createPublicKey(readFileSync(env.GC_ROUTING_PUBLIC_KEY_FILE));
  const loadPolicy = () => readSignedPolicy(JSON.parse(readFileSync(env.GC_ROUTING_POLICY_FILE, 'utf8')), publicKey);
  loadPolicy(); // Fail startup if the mounted release artifact is missing, expired or invalid.
  const store = createRoutingStore(db);
  const orchestrator = createOrchestrator({ loadPolicy, store, providers, validators });
  return { orchestrator, summary: async () => {
    const { rows, truncated } = await store.listRecent({ since: Date.now() - 7 * 86400000 });
    return summarizeRouting(rows, { truncated });
  } };
}
module.exports = { createAutomaticRuntime };
