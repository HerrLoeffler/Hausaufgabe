const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('./auth-profile.js'), 'utf8')
  .replace('export async function', 'async function')
  .concat('\nmodule.exports = { publishAuthProfileForGeneration };');
const context = vm.createContext({ module: { exports: {} }, Promise });
vm.runInContext(source, context);
const { publishAuthProfileForGeneration } = context.module.exports;

test('a stale profile read never publishes its account label', async () => {
  let currentGeneration = 1;
  let published;
  let resolveRead;
  const task = publishAuthProfileForGeneration({
    readProfile: () => new Promise(resolve => { resolveRead = resolve; }),
    isCurrent: () => currentGeneration === 1,
    publishProfile: profile => { published = profile; }
  });
  currentGeneration = 2;
  resolveRead({ displayName: 'Teacher A' });
  assert.equal(await task, null);
  assert.equal(published, undefined);
});
