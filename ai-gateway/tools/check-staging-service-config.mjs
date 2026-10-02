import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const REQUIRED_ANTHROPIC_ENV = Object.freeze([
  'ANTHROPIC_FEDERATION_RULE_ID',
  'ANTHROPIC_ORGANIZATION_ID',
  'ANTHROPIC_SERVICE_ACCOUNT_ID',
  'ANTHROPIC_WORKSPACE_ID'
]);

function envEntries(service) {
  const entries = service?.spec?.template?.spec?.containers?.[0]?.env;
  return Array.isArray(entries) ? entries : [];
}

export function inspectStagingServiceConfig(service, {
  runtimeServiceAccount,
  openAiSecretName = 'OPENAI_API_KEY'
} = {}) {
  const errors = [];
  const entries = envEntries(service);
  const environmentNames = entries
    .map(entry => String(entry?.name || ''))
    .filter(Boolean)
    .sort();
  const actualRuntimeServiceAccount = String(service?.spec?.template?.spec?.serviceAccountName || '');

  if (!runtimeServiceAccount) {
    errors.push('Expected runtime service account was not supplied to the preflight checker.');
  } else if (actualRuntimeServiceAccount !== runtimeServiceAccount) {
    errors.push(`Unexpected runtime service account: ${actualRuntimeServiceAccount || '(missing)'}`);
  }

  for (const name of REQUIRED_ANTHROPIC_ENV) {
    if (!environmentNames.includes(name)) errors.push(`Missing required environment variable: ${name}`);
  }

  const openAiEntry = entries.find(entry => entry?.name === 'OPENAI_API_KEY');
  const openAiSecretRef = String(openAiEntry?.valueFrom?.secretKeyRef?.name || '');
  if (!openAiEntry) {
    errors.push('Missing required environment variable: OPENAI_API_KEY');
  } else if (!openAiSecretRef) {
    errors.push('OPENAI_API_KEY is not configured through a Secret Manager reference.');
  } else if (openAiSecretRef !== openAiSecretName) {
    errors.push(`OPENAI_API_KEY uses unexpected secret reference: ${openAiSecretRef}`);
  }

  const serviceUrl = String(service?.status?.url || '');
  if (!serviceUrl) errors.push('Cloud Run service URL is missing.');

  const traffic = Array.isArray(service?.status?.traffic) ? service.status.traffic : [];
  const activeTraffic = traffic.find(item => Number(item?.percent || 0) === 100 && !String(item?.tag || ''));
  const previousRevision = String(activeTraffic?.revisionName || '');
  if (!previousRevision) {
    errors.push('No untagged Cloud Run revision currently owns 100% of normal traffic.');
  }

  return {
    ok: errors.length === 0,
    errors,
    serviceUrl,
    previousRevision,
    safeSummary: {
      runtimeServiceAccount: actualRuntimeServiceAccount || '(missing)',
      environmentNames,
      openAiSecretRef: openAiSecretRef || '(missing)',
      serviceUrlPresent: Boolean(serviceUrl),
      previousRevision: previousRevision || '(missing)'
    }
  };
}

function writeGithubOutputs({ serviceUrl, previousRevision }) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;
  fs.appendFileSync(output, `service_url=${serviceUrl}\nprevious_revision=${previousRevision}\n`);
}

function runCli() {
  const file = process.argv[2];
  if (!file) {
    console.error('[gateway-preflight] Usage: node check-staging-service-config.mjs <service-json>');
    process.exitCode = 2;
    return;
  }

  let service;
  try {
    service = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`[gateway-preflight] Could not read Cloud Run service metadata: ${error.message}`);
    process.exitCode = 2;
    return;
  }

  const result = inspectStagingServiceConfig(service, {
    runtimeServiceAccount: process.env.RUNTIME_SERVICE_ACCOUNT,
    openAiSecretName: process.env.OPENAI_SECRET_NAME || 'OPENAI_API_KEY'
  });

  console.log('[gateway-preflight] Safe configuration summary:');
  console.log(`[gateway-preflight] runtime service account: ${result.safeSummary.runtimeServiceAccount}`);
  console.log(`[gateway-preflight] environment names: ${result.safeSummary.environmentNames.join(', ') || '(none)'}`);
  console.log(`[gateway-preflight] OpenAI secret reference: ${result.safeSummary.openAiSecretRef}`);
  console.log(`[gateway-preflight] service URL present: ${result.safeSummary.serviceUrlPresent}`);
  console.log(`[gateway-preflight] active revision: ${result.safeSummary.previousRevision}`);

  if (!result.ok) {
    for (const error of result.errors) console.error(`[gateway-preflight] ERROR: ${error}`);
    process.exitCode = 1;
    return;
  }

  writeGithubOutputs(result);
  console.log('[gateway-preflight] Service configuration matches the guarded staging contract.');
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) runCli();
