import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'lab', 'fast-quiz');
const destination = process.argv[2];

if (!destination || !path.isAbsolute(destination)) throw new Error('An absolute build directory is required.');

const output = path.join(destination, 'public');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('Build directory must be empty.');

const files = ['index.html', 'styles.css', 'fastquiz-v4.css', 'math-engine-v4.js', 'app-v4.js'];
for (const name of files) await fs.copyFile(path.join(source, name), path.join(output, name));

const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
for (const reference of ['styles.css', 'fastquiz-v4.css', 'math-engine-v4.js', 'app-v4.js']) {
  if (!html.includes(reference)) throw new Error(`Missing HTML reference: ${reference}`);
  await fs.access(path.join(output, reference));
}
for (const marker of ['Üben', 'All-Time-Highscore', 'Live mit Lehrkraft', 'Rundencode', 'Live-Scoreboard', '30 Teilnehmende']) {
  if (!html.includes(marker)) throw new Error(`Fast Quiz V4 build check failed: ${marker}`);
}

const app = await fs.readFile(path.join(output, 'app-v4.js'), 'utf8');
for (const required of ['createLiveRoom', 'joinLiveRoom', 'startHighscore', 'finishHighscoreAttempt', 'wrongPenalty', 'lockSeconds', 'roomState', 'submitLive']) {
  if (!app.includes(required)) throw new Error(`Fast Quiz V4 app check failed: ${required}`);
}

const engine = await fs.readFile(path.join(output, 'math-engine-v4.js'), 'utf8');
for (const required of ['naturalQuestion', 'integerQuestion', 'decimalQuestion', 'fractionQuestion', 'LEVEL_RULES', "n1", "n2", "n3", "n4"]) {
  if (!engine.includes(required)) throw new Error(`Fast Quiz V4 math-engine check failed: ${required}`);
}

const hashes = {};
for (const name of files) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');

await fs.writeFile(path.join(output, 'lab-release.json'), JSON.stringify({ experiment: 'fast-quiz', format: 4, files: hashes }, null, 2) + '\n');
await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({ hosting: {
  site: 'hausaufgabe-staging', public: 'public', ignore: ['**/.*'],
  headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
} }, null, 2) + '\n');

console.log(`Fast Quiz Lab V4 build verified: ${files.length} app files.`);
