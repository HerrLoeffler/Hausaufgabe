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
const startscreenCss = read('gradecrew-auth-startscreen.css');
const startscreenPolishCss = read('gradecrew-auth-startscreen-polish.css');
const entryFlow = read('gradecrew-entry-flow.js');

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

test('teacher startup loads and activates public entry before app handlers', () => {
  const tokensIndex = startup.indexOf('./generated/gradecrew-design-tokens.css?v=1.1.0');
  const dashboardIndex = startup.indexOf('./gradecrew-dashboard-foundation.css?v=1');
  const startscreenIndex = startup.indexOf('./gradecrew-auth-startscreen.css?v=4');
  const startscreenPolishIndex = startup.indexOf('./gradecrew-auth-startscreen-polish.css?v=1');
  const entryIndex = startup.indexOf('./gradecrew-entry-flow.js?v=4');
  const installIndex = startup.indexOf('installGradeCrewEntryFlow();');
  const appIndex = startup.indexOf('./app.js?v=2.3.1-gc28');
  assert.ok(tokensIndex >= 0, 'shared token stylesheet must be installed');
  assert.ok(dashboardIndex > tokensIndex, 'dashboard stylesheet must follow shared tokens');
  assert.ok(startscreenIndex > tokensIndex, 'startscreen stylesheet must follow shared tokens');
  assert.ok(startscreenPolishIndex > startscreenIndex, 'polish layer must load after the stable startscreen stylesheet');
  assert.ok(entryIndex >= 0 && entryIndex < installIndex, 'public entry module must load before its installer runs');
  assert.ok(installIndex > entryIndex && installIndex < appIndex, 'public entry installer must run before app handlers bind');
});

test('staging build packages focused design and entry files', () => {
  assert.match(build, /generated\/gradecrew-design-tokens\.css/);
  assert.match(build, /gradecrew-dashboard-foundation\.css/);
  assert.match(build, /gradecrew-auth-startscreen\.css/);
  assert.match(build, /gradecrew-auth-startscreen-polish\.css/);
  assert.match(build, /gradecrew-entry-flow\.js/);
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

const hasGeneratedCopy = css => {
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[;{])\s*content\s*:\s*([^;}]*)(?=[;}])/gi);
  return [...declarations].some(([, value]) => !/^(?:""|''|none|normal)\s*(?:!important)?$/i.test(value.trim()));
};

test('generated-copy guard permits decoration and rejects untranslated CSS text', () => {
  for (const css of ['.a{content:"";}', ".a{content:'';}", '.a{justify-content:flex-end;}', '.a{content:none;}', '.a{content:normal;}']) assert.equal(hasGeneratedCopy(css), false, css);
  for (const css of ['.a{content:"Welcome";}', '.a{content:attr(title);}', '.a{content:var(--copy);}', '.a{content:url(image.svg);}']) assert.equal(hasGeneratedCopy(css), true, css);
});

test('startscreen polish layer stays isolated from product screens', () => {
  assert.match(startscreenPolishCss, /\.gcPublicEntryMode #authView/);
  assert.doesNotMatch(startscreenPolishCss, /#dashboardView|#studentView|#secure/);
  assert.equal(hasGeneratedCopy(startscreenPolishCss), false, 'visible copy must stay in DOM/i18n, never CSS content');
  assert.equal(startscreenPolishCss.includes('data:image'), false, 'polish layer must not hide language in data images');
});

test('public entry uses the canonical manifest and remains auth-scoped', () => {
  assert.match(entryFlow, /GRADECREW_ASSETS/);
  assert.match(entryFlow, /CREW, DEMO_TEST/);
  assert.match(startscreenCss, /#authView \.gcEntryShell/);
  assert.match(startscreenCss, /#authView \.gcEntryWelcome/);
  assert.match(startscreenCss, /#authView \.gcEntryCharacterStage/);
  assert.match(startscreenCss, /#authView \.gcEntryClassroom/);
  assert.match(startscreenCss, /\.gcPublicEntryMode \.topbar/);
  assert.match(startscreenCss, /\.gcPublicEntryMode \.shell/);
  assert.match(startscreenCss, /#authView \.gcEntryStudent/);
  assert.doesNotMatch(entryFlow, /falcon-create\.svg/);
  assert.doesNotMatch(startscreenCss, /#dashboardView/);
  assert.doesNotMatch(startscreenCss, /#studentView/);
  assert.doesNotMatch(startscreenCss, /#secure/);
  assert.match(startscreenCss, /prefers-reduced-motion/);
});
