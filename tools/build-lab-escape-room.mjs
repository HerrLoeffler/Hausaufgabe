import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'lab', 'escape-room');
const destination = process.argv[2];
if (!destination || !path.isAbsolute(destination)) throw new Error('An absolute build directory is required.');
const output = path.join(destination, 'public');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('Build directory must be empty.');
const files = ['index.html', 'styles.css', 'escape-data.js', 'app.js', 'README.md'];
for (const name of files) await fs.copyFile(path.join(source, name), path.join(output, name));
const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
for (const reference of ['styles.css', 'escape-data.js', 'app.js']) {
  if (!html.includes(reference)) throw new Error(`Missing HTML reference: ${reference}`);
  await fs.access(path.join(output, reference));
}
for (const marker of ['Die verriegelte Schule', 'Lehrer-Vorschau', 'data-open-mode="practice"', 'gameView']) {
  if (!html.includes(marker)) throw new Error(`Escape Room HTML check failed: ${marker}`);
}
const app = await fs.readFile(path.join(output, 'app.js'), 'utf8');
for (const marker of ['gradecrew:escape-event', 'localStorage', 'validateWorldDefinition', 'game.completed', 'item.used', 'locker-sequence', 'key-sequence']) {
  if (!app.includes(marker)) throw new Error(`Escape Room app check failed: ${marker}`);
}
const gameData = await fs.readFile(path.join(output, 'escape-data.js'), 'utf8');
for (const marker of ["id: 'q1'", "id: 'q8'", "classroomDoorCode: '784'", 'supportedQuestionTypes', 'validateWorldDefinition']) {
  if (!gameData.includes(marker)) throw new Error(`Escape Room data check failed: ${marker}`);
}
const hashes = {};
for (const name of files) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');
await fs.writeFile(path.join(output, 'lab-release.json'), JSON.stringify({
  experiment: 'escape-room-locked-school', format: 1, version: '0.1.0', files: hashes,
  features: { deterministicWorld: true, questionSlots: 8, localResume: true, preflight: true, telemetryUpload: false, teacherAuth: false }
}, null, 2) + '\n');
await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({ hosting: {
  site: 'hausaufgabe-staging', public: 'public', ignore: ['**/.*'],
  headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
} }, null, 2) + '\n');
console.log('Escape Room MVP build verified: locked-school v0.1.0.');
