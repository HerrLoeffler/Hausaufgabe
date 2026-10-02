import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const destination = process.argv[2];
if (!destination || !path.isAbsolute(destination)) throw new Error('An absolute, empty build directory is required.');
const output = path.join(destination, 'public');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('Build directory must be empty.');
const config = await fs.readFile(path.join(root, 'firebase-config.staging.js'), 'utf8');
if (!config.includes('projectId: "hausaufgabe-staging"') || !config.includes('appEnvironment = "staging"')) throw new Error('Not a staging configuration.');
const files = [
  'diagnostics.mjs', 'admin-log-tools.mjs', 'index.html', 'startup.js', 'shared/i18n/i18n-core.mjs', 'shared/i18n/browser-runtime.mjs', 'shared/i18n/messages-de-DE.mjs', 'shared/i18n/messages-en-GB.mjs', 'shared/i18n/bootstrap.mjs', 'app.js', 'interface.js', 'styles.css', 'generated/gradecrew-design-tokens.css', 'design-system.css', 'gradecrew-brand.css', 'crew-clay.css', 'workspace.css', 'gradecrew-dashboard-foundation.css', 'gradecrew-tour.css', 'tutorial-choice-v1.css',
  'ai-json-tools.js', 'ai-client.js', 'ui-enhancements.js', 'visual-enhancements.js', 'mobile-viewport-polish.js', 'first-guide-responsive.js', 'crew-tour-responsive.js', 'first-guide-guard.js', 'crew-tour-hardening.js', 'crew-tour-gc22-polish.js', 'crew-tour-gc23-polish.js', 'crew-tour-gc24-polish.js', 'crew-tour-gc25-final-polish.js', 'crew-tour-gc26-story-polish.js', 'student-attempt-guard.js', 'remy-ai-help.js', 'crew-assistant-ui.js', 'crew-assistant-core.js', 'crew-assistant-core.mjs', 'emmi-whole-test-revision.mjs', 'teacher-copy-polish.js', 'gradecrew-tour.js', 'gradecrew-tour-v7.js', 'gradecrew-tour-v8.js', 'gate-e-lab.js', 'assessment-receipt-check.mjs', 'gradecrew-brand.js',
  'layout-enhancements.js', 'variant-enhancements.js', 'tutorial-variant-fallback.js', 'admin-ai-access.js',
  'editor-drafts.js', 'ai-review-state.js', 'ordering-grading.mjs', 'secure-assessment-teacher-polish.js',
  'secure-student.html', 'secure-student.js', 'secure-student.css', 'secure-assessment-client.js', 'secure-draft-persistence.js', 'secure-deadline-guard.js', 'secure-result-policy.js', 'secure-solution-release.js'
];
for (const name of await fs.readdir(path.join(root, 'assets/gradecrew'))) {
  if (name.endsWith('.svg')) files.push(`assets/gradecrew/${name}`);
}
for (const name of files) {
  const target = path.join(output, name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(path.join(root, name), target);
}
await fs.writeFile(path.join(output, 'firebase-config.js'), config);
files.push('firebase-config.js');
for (const name of files.filter(name => /\.(js|mjs|html|css)$/.test(name))) {
  const content = await fs.readFile(path.join(output, name), 'utf8');
  const references = [
    ...content.matchAll(/["'](\.\.?\/[^"'`\s]+\.(?:js|mjs)(?:\?[^"']*)?)["']/g),
    ...content.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|svg)(?:\?[^"']*)?)["']/g),
    ...content.matchAll(/url\(["']?([^\s)'"`]+\.svg)["']?\)/g)
  ];
  for (const [, reference] of references) {
    if (/^https?:/.test(reference) || reference.includes('${')) continue;
    const normalized = reference.split(/[?#]/)[0];
    const target = normalized.startsWith('/') ? path.join(output, normalized.slice(1)) : path.resolve(path.dirname(path.join(output, name)), normalized);
    if (!target.startsWith(output + path.sep)) throw new Error(`Reference outside build: ${reference}`);
    await fs.access(target).catch(() => { throw new Error(`Missing asset in ${name}: ${reference}`); });
  }
}
const hashes = {};
for (const name of files.sort()) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');
const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
const version = html.match(/name="app-version" content="([^"]+)"/)[1];
const app = await fs.readFile(path.join(output, 'app.js'), 'utf8');
if (!app.includes(`APP_VERSION = "${version}"`)) throw new Error('App and HTML versions differ.');
const release = { project: 'hausaufgabe-staging', version, commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), files: hashes };
await fs.writeFile(path.join(output, 'release.json'), JSON.stringify(release, null, 2) + '\n');
await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({ hosting: {
  site: 'hausaufgabe-staging', public: 'public', ignore: ['**/.*'],
  headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
} }, null, 2) + '\n');
console.log(`Staging build verified: ${version}, ${files.length} files.`);
