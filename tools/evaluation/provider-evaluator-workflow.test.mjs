import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../../.github/workflows/provider-evaluation.yml', import.meta.url), 'utf8');
const setup = await readFile(new URL('../automation/setup-staging-provider-evaluator.sh', import.meta.url), 'utf8');

test('manual evaluator workflow is staging-only and explicitly confirmed', () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /RUN_PHASE_A_MICROPILOT/);
  assert.match(workflow, /PROJECT_ID: hausaufgabe-staging/);
  assert.match(workflow, /test "\$PROJECT_ID" != 'hausaufgabe-40294'/);
  assert.match(workflow, /refs\/heads\/\$INTEGRATION_BRANCH/);
  assert.match(workflow, /STAGING_EVALUATOR_WIF_PROVIDER/);
});

test('micro-pilot hard caps remain small and fixed', () => {
  assert.match(workflow, /EVALUATION_MAX_CALLS: '8'/);
  assert.match(workflow, /EVALUATION_MAX_MICRO_USD: '500000'/);
  assert.match(workflow, /EVALUATION_DAILY_MICROS: '1000000'/);
  assert.match(workflow, /EVALUATION_MONTHLY_MICROS: '5000000'/);
  assert.match(workflow, /EVALUATION_DAILY_CALLS: '40'/);
  assert.match(workflow, /--execute/);
  assert.match(workflow, /GC_EVALUATION_EXECUTE: 'true'/);
});

test('workflow only permits the three synthetic development bundles', () => {
  for (const file of [
    'phase-a-crew-intent.de.dev.v1.json',
    'phase-a-question-rewriting.de.dev.v1.json',
    'phase-a-game-hint.de.dev.v1.json',
  ]) assert.ok(workflow.includes(file));
  assert.match(workflow, /\.reviewStatus == "development"/);
  assert.doesNotMatch(workflow, /held_out_reviewed/);
});

test('bootstrap identity has no secret/deploy/artifact roles and excludes production', () => {
  assert.match(setup, /gradecrew-ai-evaluator-staging/);
  assert.match(setup, /roles\/datastore\.user/);
  assert.match(setup, /roles\/run\.viewer/);
  assert.match(setup, /roles\/run\.invoker/);
  assert.match(setup, /staging-evaluator/);
  assert.match(setup, /provider-evaluation\.yml/);
  assert.doesNotMatch(setup, /roles\/secretmanager\.secretAccessor/);
  assert.doesNotMatch(setup, /roles\/run\.developer/);
  assert.doesNotMatch(setup, /roles\/artifactregistry\.writer/);
  assert.match(setup, /Production.*ausgeschlossen/);
});
