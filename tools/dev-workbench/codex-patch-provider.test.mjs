import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCodexPatch } from './codex-patch-provider.mjs';

function fakeSpawn({ events = [], exitCode = 0, stderr = '' } = {}) {
  const calls = [];
  const spawn = (command, args, options) => {
    calls.push({ command, args, options });
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.stdin = new Writable({ write(_chunk, _encoding, done) { done(); } });
    child.kill = signal => { child.killSignal = signal; return true; };
    setImmediate(async () => {
      const call = calls.at(-1);
      try { call.sourceContent = await fs.readFile(path.join(options.cwd, 'index.html'), 'utf8'); } catch {}
      const output = args[args.indexOf('--output-last-message') + 1];
      await fs.writeFile(output, JSON.stringify({ summary: 'Farbwert angepasst.', changes: [] }));
      for (const event of events) child.stdout.write(`${JSON.stringify(event)}\n`);
      if (stderr) child.stderr.write(stderr);
      child.emit('close', exitCode);
    });
    return child;
  };
  return { calls, spawn };
}

test('routine request launches once with explicit Luna medium and the bounded CLI settings', async () => {
  const fake = fakeSpawn({ events: [
    { type: 'turn.started', model: 'gpt-6-luna', reasoning_effort: 'medium' },
    { type: 'turn.completed', model: 'gpt-6-luna', reasoning_effort: 'medium', usage: { input_tokens: 120, cached_input_tokens: 20, output_tokens: 30, reasoning_output_tokens: 5 } },
  ] });
  const receipts = [];
  const sources = new Map([['index.html', '<h1>Test</h1>']]);
  const result = await runCodexPatch({
    sources, note: { id: 'note-1', text: 'Passe die Überschrift an.', target: { selector: 'h1' } },
    project: { id: 'fixture', label: 'Fixture' }, codexBin: process.execPath, spawnImpl: fake.spawn,
    governance: { taskId: null, noteId: 'note-1', requestId: 'request-1', phase: 'live_patch', risk: 'routine' },
    onGovernanceReceipt: receipt => receipts.push(receipt),
  });
  assert.equal(fake.calls.length, 1);
  const { args, options } = fake.calls[0];
  assert.deepEqual(args.slice(args.indexOf('--model'), args.indexOf('--model') + 4), ['--model', 'gpt-6-luna', '-c', 'model_reasoning_effort="medium"']);
  assert.equal(args[args.indexOf('--sandbox') + 1], 'read-only');
  assert(args.includes('--ephemeral'));
  assert(args.includes('--skip-git-repo-check'));
  assert.equal(args[args.indexOf('-C') + 1], options.cwd);
  assert.equal(fake.calls[0].sourceContent, '<h1>Test</h1>');
  assert.equal(result.summary, 'Farbwert angepasst.');
  assert.deepEqual(result.governanceReceipt, {
    taskId: null, noteId: 'note-1', requestId: 'request-1', phase: 'live_patch', risk: 'routine',
    requestedModel: 'gpt-6-luna', requestedEffort: 'medium', requestedBy: 'policy', acceptanceHash: 'unknown',
    failureKind: null, failureEvidenceHash: 'unknown', hostAcceptedModel: 'gpt-6-luna',
    hostAcceptedEffort: 'medium', observedRuntimeModel: 'gpt-6-luna', observedRuntimeEffort: 'medium',
    inputTokens: 120, cachedInputTokens: 20, outputTokens: 30, reasoningOutputTokens: 5, status: 'completed',
  });
  assert.equal(receipts[0].status, 'prepared');
  assert.equal(receipts[1].status, 'unknown');
  assert(!Object.hasOwn(result.governanceReceipt, 'prompt'));
});

test('a host-reported model mismatch stops the one launch and is recorded', async () => {
  const fake = fakeSpawn({ events: [{ type: 'turn.started', model: 'gpt-6.1-sol', reasoning_effort: 'medium' }] });
  const receipts = [];
  await assert.rejects(runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-2', text: 'Kleine Routine.' },
    project: { id: 'fixture', label: 'Fixture' }, codexBin: process.execPath, spawnImpl: fake.spawn,
    governance: { taskId: null, noteId: 'note-2', requestId: 'request-2', phase: 'live_patch', risk: 'routine' },
    onGovernanceReceipt: receipt => receipts.push(receipt),
  }), /anderes Modell/);
  assert.equal(fake.calls.length, 1);
  assert.equal(receipts.at(-1).status, 'mismatch');
  assert.equal(receipts.at(-1).requestedModel, 'gpt-6-luna');
  assert.equal(receipts.at(-1).hostAcceptedModel, 'gpt-6.1-sol');
  assert.equal(receipts.at(-1).observedRuntimeModel, 'unknown');
});

test('an unavailable model blocks before any CLI process is spawned', async () => {
  const fake = fakeSpawn();
  await assert.rejects(runCodexPatch({
    sources: new Map(), note: { id: 'note-3', text: 'Routine.' }, project: { id: 'fixture' },
    codexBin: process.execPath, spawnImpl: fake.spawn,
    governance: { risk: 'routine', availableModels: ['gpt-6.1-sol'] },
  }), { code: 'MODEL_UNAVAILABLE' });
  assert.equal(fake.calls.length, 0);
});

test('a failed prepared receipt prevents the CLI process from starting', async () => {
  const fake = fakeSpawn();
  await assert.rejects(runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-receipt-1', text: 'Routine.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: fake.spawn,
    onGovernanceReceipt: async () => { throw Error('storage unavailable'); },
  }), /nicht gestartet/);
  assert.equal(fake.calls.length, 0);
});

test('a failed pre-start unknown receipt prevents the CLI process from starting', async () => {
  const fake = fakeSpawn();
  const receipts = [];
  await assert.rejects(runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-receipt-2', text: 'Routine.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: fake.spawn,
    onGovernanceReceipt: async receipt => {
      receipts.push(receipt);
      if (receipt.status === 'unknown') throw Error('storage unavailable');
    },
  }), /nicht gestartet/);
  assert.equal(receipts[0].status, 'prepared');
  assert.equal(receipts[1].status, 'unknown');
  assert.equal(fake.calls.length, 0);
});

test('a receipt failure after turn start stays unknown and does not preserve unverified usage', async () => {
  const fake = fakeSpawn({ events: [
    { type: 'turn.started', model: 'gpt-6-luna', reasoning_effort: 'medium' },
    { type: 'turn.completed', model: 'gpt-6-luna', reasoning_effort: 'medium', usage: { input_tokens: 120, output_tokens: 30 } },
  ] });
  const saved = [];
  await assert.rejects(runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-receipt-3', text: 'Routine.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: fake.spawn,
    onGovernanceReceipt: async receipt => {
      if (receipt.status === 'started') throw Error('storage unavailable');
      saved.push(receipt);
    },
  }), /Ergebnis und Usage bleiben unbekannt/);
  assert.equal(fake.calls.length, 1);
  assert.equal(saved.at(-1).status, 'unknown');
  assert.equal(saved.at(-1).inputTokens, 'unknown');
  assert.equal(saved.at(-1).outputTokens, 'unknown');
});

test('one acceptance digest permits a completed-to-semantic escalation and rejects changed criteria', async () => {
  const acceptance = 'a'.repeat(64);
  const first = fakeSpawn({ events: [
    { type: 'turn.started', model: 'gpt-6-luna', reasoning_effort: 'medium' },
    { type: 'turn.completed', model: 'gpt-6-luna', reasoning_effort: 'medium' },
  ] });
  const prior = await runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-acceptance-1', text: 'Routine edit.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: first.spawn,
    governance: { taskId: 'GC-MODEL-GOVERNOR-01', noteId: 'note-acceptance-1', phase: 'implementation', risk: 'routine', acceptance, acceptanceHash: acceptance },
  });
  assert.equal(prior.governanceReceipt.status, 'completed');
  assert.equal(prior.governanceReceipt.acceptanceHash, acceptance);

  const retry = fakeSpawn({ events: [
    { type: 'turn.started', model: 'gpt-6.1-sol', reasoning_effort: 'medium' },
    { type: 'turn.completed', model: 'gpt-6.1-sol', reasoning_effort: 'medium' },
  ] });
  const repeated = await runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-acceptance-2', text: 'Complexity retry.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: retry.spawn,
    governance: {
      taskId: 'GC-MODEL-GOVERNOR-01', noteId: 'note-acceptance-2', phase: 'implementation', risk: 'complexity',
      reason: 'The first narrow attempt did not satisfy the fixed acceptance check.', model: 'gpt-6.1-sol', effort: 'medium', acceptance, acceptanceHash: acceptance,
      failure: { kind: 'semantic', evidence: 'The same acceptance check still fails.', acceptance },
      history: [{ model: prior.governanceReceipt.requestedModel, effort: prior.governanceReceipt.requestedEffort, acceptance: prior.governanceReceipt.acceptanceHash, risk: 'routine', status: 'completed' }],
    },
  });
  assert.equal(retry.calls.length, 1);
  assert.equal(repeated.governanceReceipt.acceptanceHash, acceptance);

  const changed = fakeSpawn();
  await assert.rejects(runCodexPatch({
    sources: new Map([['index.html', '<h1>Test</h1>']]), note: { id: 'note-acceptance-3', text: 'Changed criteria.' },
    project: { id: 'fixture' }, codexBin: process.execPath, spawnImpl: changed.spawn,
    governance: {
      taskId: 'GC-MODEL-GOVERNOR-01', noteId: 'note-acceptance-3', phase: 'implementation', risk: 'complexity',
      reason: 'The acceptance criterion changed.', model: 'gpt-6.1-sol', effort: 'medium', acceptance: 'b'.repeat(64), acceptanceHash: 'b'.repeat(64),
      failure: { kind: 'semantic', evidence: 'New criterion.', acceptance: 'b'.repeat(64) },
      history: [{ model: prior.governanceReceipt.requestedModel, effort: prior.governanceReceipt.requestedEffort, acceptance: prior.governanceReceipt.acceptanceHash, risk: 'routine', status: 'completed' }],
    },
  }), { code: 'ACCEPTANCE_CHANGED' });
  assert.equal(changed.calls.length, 0);
});
