import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const tokens = JSON.parse(read('shared/gradecrew-design/tokens.json'));
const assets = JSON.parse(read('shared/gradecrew-design/assets.json'));
const generatedTokens = read('generated/gradecrew-design-tokens.css');
const startup = read('startup.js');
const build = read('tools/build-staging.mjs');
const dashboardCss = read('gradecrew-dashboard-foundation.css');

test('shared tokens keep accessibility and canonical GradeCrew values', () => {
  assert.equal(tokens.version, '1.1.0');
  assert.equal(tokens.layout.minimumTouchTarget, 44);
  assert.equal(tokens.layout.controlHeight, 44);
  assert.equal(tokens.motion.respectReducedMotion, true);
  assert.equal(tokens.colors.primary, '#285ac9');
  assert.match(generatedTokens, /--gc-layout-minimum-touch-target: 44px;/);
  assert.match(generatedTokens, /--gc-colors-primary: #285ac9;/);
});

test('canonical Crew manifest preserves established roles', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(assets.mascots).map(([name, mascot]) => [name, mascot.role])),
    { coco: 'guide', remy: 'create', emmi: 'improve', wilma: 'grade' }
  );
  assert.equal(assets.mascots.remy.primary, 'elephant-create.svg');
  assert.equal(assets.rules.singleSource, true);
  assert.equal(assets.rules.newCodeMustUseManifestNames, true);
});

test('teacher startup loads shared tokens before the focused dashboard layer', () => {
  const tokensIndex = startup.indexOf('./generated/gradecrew-design-tokens.css?v=1.1.0');
  const dashboardIndex = startup.indexOf('./gradecrew-dashboard-foundation.css?v=1');
  assert.ok(tokensIndex >= 0, 'shared token stylesheet must be installed');
  assert.ok(dashboardIndex > tokensIndex, 'dashboard stylesheet must follow shared tokens');
});

test('staging build packages both new design stylesheets', () => {
  assert.match(build, /generated\/gradecrew-design-tokens\.css/);
  assert.match(build, /gradecrew-dashboard-foundation\.css/);
});

test('dashboard foundation stays scoped away from student and secure assessment screens', () => {
  assert.match(dashboardCss, /#dashboardView > \.pageHead/);
  assert.match(dashboardCss, /#dashboardView #newQuizBtn/);
  assert.match(dashboardCss, /#dashboardView \.quizCard/);
  assert.match(dashboardCss, /#createView #createAiBtn/);
  assert.doesNotMatch(dashboardCss, /#studentView/);
  assert.doesNotMatch(dashboardCss, /#secure/);
  assert.doesNotMatch(dashboardCss, /\.studentQuestion/);
});
