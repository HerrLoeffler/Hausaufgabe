import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the production link builders without initializing Auth or reading accounts.
const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const builders = ['baseStudentUrl', 'baseTemplateUrl'].map(name => {
  const match = source.match(new RegExp(`function ${name}\\([^]*?(?=\\nfunction )`));
  assert.ok(match, `Production builder ${name} exists`);
  return match[0];
}).join('\n');

for (const origin of ['https://gradecrew.de', 'https://hausaufgabe-staging.web.app', 'https://gradecrew-staging-2026.web.app', 'http://127.0.0.1:8782']) {
  test(`published and preview links retain the actual origin on ${origin}`, () => {
    const context = vm.createContext({ URL, window: { location: { href: `${origin}/index.html?teacher=1#editor` } } });
    vm.runInContext(builders, context);
    const code = 'SYNTH+A/B?C';
    const published = new URL(context.baseStudentUrl(code));
    assert.equal(published.origin, origin);
    assert.equal(published.pathname, '/index.html');
    assert.equal(published.searchParams.get('test'), code);
    assert.deepEqual([...published.searchParams.keys()], ['test']);
    assert.equal(published.hash, '');
    const preview = new URL(context.baseStudentUrl(code, true));
    assert.equal(preview.origin, origin);
    assert.equal(preview.searchParams.get('test'), code);
    assert.equal(preview.searchParams.get('preview'), '1');
    const template = new URL(context.baseTemplateUrl(code));
    assert.equal(template.origin, origin);
    assert.equal(template.searchParams.get('template'), code);
    assert.deepEqual([...template.searchParams.keys()], ['template']);
  });
}
