import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.resolve(process.argv[2] || '.firebase-escape-adventure');
const publicDir = path.join(target, 'public');
const sharedDir = path.join(publicDir, 'shared');

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(sharedDir, { recursive: true });

for (const name of ['index.html', 'styles.css', 'app.js']) {
  fs.copyFileSync(path.join(root, 'lab/escape-room-adventure', name), path.join(publicDir, name));
}
for (const [src, dest] of [
  ['gradecrew-brand.css', 'gradecrew-brand.css'],
  ['crew-clay.css', 'crew-clay.css'],
  ['assets/gradecrew/penguin-guide.svg', 'penguin-guide.svg']
]) {
  fs.copyFileSync(path.join(root, src), path.join(sharedDir, dest));
}

const firebase = {
  hosting: {
    public: 'public',
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
    headers: [{ source: '**/*.@(js|css|svg)', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
  }
};
fs.writeFileSync(path.join(target, 'firebase.json'), JSON.stringify(firebase, null, 2));

const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(publicDir, 'app.js'), 'utf8');
if (!html.includes('gameCanvas') || !html.includes('touch-controls')) throw new Error('Adventure controls missing from build.');
if (!js.includes("value==='784'") || !js.includes("new Set(['shelf','computer','board'])")) throw new Error('Adventure progression/anti-guessing guard missing.');
if (/https?:\/\//.test(html) || /https?:\/\//.test(js)) throw new Error('Adventure build must not depend on external runtime assets.');
console.log(`Escape Adventure room-one build verified at ${target}`);
