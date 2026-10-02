import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectStagingServiceConfig } from '../tools/check-staging-service-config.mjs';

const EXPECTED_SA = 'gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com';

function fixture() {
  return {
    spec: {
      template: {
        spec: {
          serviceAccountName: EXPECTED_SA,
          containers: [{
            env: [
              { name: 'ANTHROPIC_FEDERATION_RULE_ID', value: 'redacted' },
              { name: 'ANTHROPIC_ORGANIZATION_ID', value: 'redacted' },
              { name: 'ANTHROPIC_SERVICE_ACCOUNT_ID', value: 'redacted' },
              { name: 'ANTHROPIC_WORKSPACE_ID', value: 'redacted' },
              { name: 'OPENAI_API_KEY', valueFrom: { secretKeyRef: { name: 'OPENAI_API_KEY', key: 'latest' } } }
            ]
          }]
        }
      }
    },
    status: {
      url: 'https://gateway.example.test',
      traffic: [{ revisionName: 'gateway-00042', percent: 100 }]
    }
  };
}

test('accepts the guarded staging service shape and exposes only safe metadata', () => {
  const result = inspectStagingServiceConfig(fixture(), { runtimeServiceAccount: EXPECTED_SA });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.previousRevision, 'gateway-00042');
  assert.equal(result.safeSummary.openAiSecretRef, 'OPENAI_API_KEY');
  assert.equal(result.safeSummary.environmentNames.includes('ANTHROPIC_WORKSPACE_ID'), true);
  assert.equal(JSON.stringify(result.safeSummary).includes('redacted'), false);
});

test('reports the exact missing environment variable without exposing values', () => {
  const service = fixture();
  service.spec.template.spec.containers[0].env = service.spec.template.spec.containers[0].env
    .filter(entry => entry.name !== 'ANTHROPIC_WORKSPACE_ID');
  const result = inspectStagingServiceConfig(service, { runtimeServiceAccount: EXPECTED_SA });
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, ['Missing required environment variable: ANTHROPIC_WORKSPACE_ID']);
});

test('reports an unexpected OpenAI secret reference by name, never by secret value', () => {
  const service = fixture();
  service.spec.template.spec.containers[0].env.find(entry => entry.name === 'OPENAI_API_KEY')
    .valueFrom.secretKeyRef.name = 'OPENAI_API_KEY_STAGING';
  const result = inspectStagingServiceConfig(service, { runtimeServiceAccount: EXPECTED_SA });
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, ['OPENAI_API_KEY uses unexpected secret reference: OPENAI_API_KEY_STAGING']);
  assert.equal(JSON.stringify(result).includes('redacted'), false);
});

test('fails closed when normal traffic is not owned by one untagged revision', () => {
  const service = fixture();
  service.status.traffic = [{ revisionName: 'gateway-candidate', percent: 100, tag: 'candidate' }];
  const result = inspectStagingServiceConfig(service, { runtimeServiceAccount: EXPECTED_SA });
  assert.equal(result.ok, false);
  assert.equal(result.errors.includes('No untagged Cloud Run revision currently owns 100% of normal traffic.'), true);
});
