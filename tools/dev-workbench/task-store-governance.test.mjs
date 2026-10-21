import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createTaskStore } from './task-store.mjs';

test('explicit governance metadata round trips while strict note fields and request dedupe remain enforced', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gc-governance-store-'));
  try {
    const store = createTaskStore(path.join(dir, 'tasks.json'));
    const input = {
      text: 'Make the selected button clearer.', projectId: 'fixture', clientRequestId: 'request-1234',
      taskId: 'GC-MODEL-GOVERNOR-01', phase: 'implementation', risk: 'complexity',
      model: 'gpt-6.1-sol', effort: 'medium', modelReason: 'Two dependent frontend modules must change together.',
      modelAuthorization: 'owner-approved-01', acceptance: 'The selected button remains keyboard accessible.',
      failureKind: 'semantic', failureEvidence: 'The keyboard acceptance check still fails.', securityStepComplete: false,
    };
    const created = await store.create(input);
    const loaded = (await store.list({ projectId: 'fixture' })).tasks[0];
    for (const key of ['taskId', 'phase', 'risk', 'model', 'effort', 'modelReason', 'modelAuthorization', 'acceptance', 'failureKind', 'failureEvidence', 'securityStepComplete']) {
      assert.equal(loaded[key], input[key], `${key} survives storage`);
    }
    assert.equal(created.clientRequestId, 'request-1234');
    await assert.rejects(store.create({ ...input, model: 'gpt-6-luna' }), /abweichenden Hinweis/);
    await assert.rejects(store.create({ ...input, systemPrompt: 'external text' }), /nicht erlaubte Felder/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
