import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const expected = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (expected.project !== 'hausaufgabe-staging') throw new Error('Staging verification only.');
const origin = 'https://hausaufgabe-staging.web.app';
for (const name of ['index.html', 'startup.js', 'app.js', 'interface.js', 'firebase-config.js', 'visual-enhancements.js', 'ui-enhancements.js', 'variant-enhancements.js', 'gradecrew-brand.css', 'workspace.css', 'assets/gradecrew/penguin-guide.svg']) {
  const response = await fetch(`${origin}/${name}?release=${expected.commit}`, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const hash = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
  if (hash !== expected.files[name]) throw new Error(`Staging still serves a different version of ${name}.`);
}
console.log(`Remote assets match ${expected.version}.`);
