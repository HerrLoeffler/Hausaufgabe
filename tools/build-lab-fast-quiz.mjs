import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'lab', 'fast-quiz');
const destination = process.argv[2];

if (!destination || !path.isAbsolute(destination)) {
  throw new Error('An absolute build directory is required.');
}

const output = path.join(destination, 'public');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('Build directory must be empty.');

const files = ['index.html', 'styles.css', 'app.js'];
for (const name of files) {
  await fs.copyFile(path.join(source, name), path.join(output, name));
}

const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
for (const reference of ['styles.css', 'app.js']) {
  if (!html.includes(reference)) throw new Error(`Missing HTML reference: ${reference}`);
  await fs.access(path.join(output, reference));
}
if (!html.includes('Fast Quiz')) throw new Error('Fast Quiz build check failed: page title missing');

const app = await fs.readFile(path.join(output, 'app.js'), 'utf8');
for (const required of ['roundCode', 'durationSec', 'generateQuestion', 'startRound', 'finishRound']) {
  if (!app.includes(required)) throw new Error(`Fast Quiz build check failed: ${required}`);
}

const hashes = {};
for (const name of files) {
  hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');
}

await fs.writeFile(path.join(output, 'lab-release.json'), JSON.stringify({
  experiment: 'fast-quiz',
  format: 1,
  files: hashes
}, null, 2) + '\n');

await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({
  hosting: {
    site: 'hausaufgabe-staging',
    public: 'public',
    ignore: ['**/.*'],
    headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
  }
}, null, 2) + '\n');

console.log(`Fast Quiz lab build verified: ${files.length} app files.`);
