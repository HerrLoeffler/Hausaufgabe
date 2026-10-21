import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createLiveEditor } from './live-editor.mjs';

test('live job forwards stored metadata to the provider and exposes its technical receipt', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gc-live-governance-'));
  try {
    const projectRoot = path.join(dir, 'project');
    await fs.mkdir(projectRoot);
    await fs.writeFile(path.join(projectRoot, 'index.html'), '<h1>Before</h1>');
    const note = {
      id: 'note-1', text: 'Update the selected heading.', projectId: 'fixture',
      taskId: 'GC-MODEL-GOVERNOR-01', phase: 'implementation', risk: 'complexity',
      model: 'gpt-6.1-sol', effort: 'medium', modelReason: 'Two related components need coordinated edits.',
      acceptance: 'The heading remains visible on mobile.',
    };
    const taskStore = {
      async list() { return { tasks: [note], nextCursor: null }; },
      async update() { return note; },
      captureDir: dir,
    };
    const provider = async input => {
      assert.equal(input.governance.taskId, 'GC-MODEL-GOVERNOR-01');
      assert.equal(input.governance.noteId, 'note-1');
      assert.equal(input.governance.requestId, 'request-1234');
      assert.equal(input.governance.phase, 'implementation');
      assert.equal(input.governance.risk, 'complexity');
      assert.equal(input.governance.model, 'gpt-6.1-sol');
      assert.equal(input.governance.effort, 'medium');
      assert.match(input.governance.acceptance, /^[0-9a-f]{64}$/);
      assert.equal(input.governance.acceptanceHash, input.governance.acceptance);
      assert.deepEqual(input.governance.history, []);
      const receipt = {
        taskId: note.taskId, noteId: note.id, requestId: 'request-1234', phase: 'implementation', risk: 'complexity',
        requestedModel: 'gpt-6.1-sol', requestedEffort: 'medium', hostAcceptedModel: 'unknown',
        requestedBy: 'human', acceptanceHash: input.governance.acceptance, failureKind: null, failureEvidenceHash: 'unknown',
        hostAcceptedEffort: 'unknown', observedRuntimeModel: 'unknown', observedRuntimeEffort: 'unknown',
        inputTokens: 'unknown', cachedInputTokens: 'unknown', outputTokens: 'unknown', reasoningOutputTokens: 'unknown', status: 'completed',
      };
      await input.onGovernanceReceipt(receipt);
      return { summary: 'Heading updated.', changes: [], governanceReceipt: receipt };
    };
    const editor = createLiveEditor({ dataDir: path.join(dir, 'data'), getProjects: () => [{ id: 'fixture', root: projectRoot }], taskStore, provider });
    const created = await editor.submit({ noteId: note.id, requestId: 'request-1234' });
    let current = created;
    for (let attempt = 0; attempt < 100 && current.status !== 'done' && current.status !== 'error'; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      current = await editor.job(created.id);
    }
    assert.equal(current.status, 'done');
    assert.deepEqual(current.governanceReceipt, {
      taskId: note.taskId, noteId: 'note-1', requestId: 'request-1234', phase: 'implementation', risk: 'complexity',
      requestedModel: 'gpt-6.1-sol', requestedEffort: 'medium', hostAcceptedModel: 'unknown',
      requestedBy: 'human', acceptanceHash: current.governanceReceipt.acceptanceHash, failureKind: null, failureEvidenceHash: 'unknown',
      hostAcceptedEffort: 'unknown', observedRuntimeModel: 'unknown', observedRuntimeEffort: 'unknown',
      inputTokens: 'unknown', cachedInputTokens: 'unknown', outputTokens: 'unknown', reasoningOutputTokens: 'unknown', status: 'completed',
    });
    const jobFile = path.join(dir, 'data', 'live-jobs', `${created.id}.json`);
    const stored = JSON.parse(await fs.readFile(jobFile, 'utf8'));
    assert.equal(stored.requestId, 'request-1234');
    assert.equal(stored.governanceReceipt.requestedModel, 'gpt-6.1-sol');
    assert.equal(stored.governanceReceipt.inputTokens, 'unknown');
    const reloaded = createLiveEditor({ dataDir: path.join(dir, 'data'), getProjects: () => [{ id: 'fixture', root: projectRoot }], taskStore, provider });
    const recovered = await reloaded.job(created.id);
    assert.deepEqual(recovered.governanceReceipt, stored.governanceReceipt);
    const duplicate = await reloaded.submit({ noteId: note.id, requestId: 'request-1234' });
    assert.equal(duplicate.id, created.id);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
