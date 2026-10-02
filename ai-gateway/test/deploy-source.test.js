'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('deploy source guard accepts current SHA and blocks stale, wrong-branch and failed GitHub reads', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-source-'));
  try {
    fs.writeFileSync(path.join(dir, 'gh'), '#!/bin/sh\n[ "$FIXTURE_FAIL" != "yes" ] || exit 2\nprintf "%s\\n" "$FIXTURE_HEAD"\n', { mode: 0o700 });
    const sha = 'a'.repeat(40);
    const run = extra => spawnSync('bash', [path.join(__dirname, '../tools/assert-current-source.sh')], {
      env: { PATH: `${dir}:${process.env.PATH}`, GITHUB_REPOSITORY: 'HerrLoeffler/Hausaufgabe',
        INTEGRATION_BRANCH: 'integration/ai-gateway-staging', GITHUB_REF: 'refs/heads/integration/ai-gateway-staging',
        GITHUB_SHA: sha, FIXTURE_HEAD: sha, ...extra }, encoding: 'utf8'
    });
    assert.equal(run({}).status, 0);
    assert.notEqual(run({ FIXTURE_HEAD: 'b'.repeat(40) }).status, 0);
    assert.notEqual(run({ GITHUB_REF: 'refs/heads/main' }).status, 0);
    assert.notEqual(run({ FIXTURE_FAIL: 'yes' }).status, 0);
    assert.notEqual(run({ FIXTURE_HEAD: '' }).status, 0);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
