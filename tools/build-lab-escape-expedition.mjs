import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.resolve(process.argv[2] || '.firebase-escape-expedition');
const publicDir = path.join(target, 'public');

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
for (const name of ['index.html', 'styles.css', 'app.js']) {
  fs.copyFileSync(path.join(root, 'lab/escape-expedition', name), path.join(publicDir, name));
}

const firebase = {
  hosting: {
    public: 'public',
    ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
    headers: [{ source: '**/*.@(js|css)', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
  }
};
fs.writeFileSync(path.join(target, 'firebase.json'), JSON.stringify(firebase, null, 2));

const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(publicDir, 'app.js'), 'utf8');
for (const required of ['Expedition Amazonas', 'gameCanvas', 'touch-controls']) {
  if (!html.includes(required)) throw new Error(`Missing expedition shell contract: ${required}`);
}
for (const required of ['updateJeep', 'pullWinch', 'takePhoto', 'updateRiver', 'chooseCircuit', 'sendRadio', "scene: 'camp'"]) {
  if (!js.includes(required)) throw new Error(`Missing expedition mechanic contract: ${required}`);
}
if (/https?:\/\//.test(html) || /https?:\/\//.test(js)) throw new Error('Expedition build must not depend on external runtime assets.');
console.log(`Escape Expedition build verified at ${target}`);
