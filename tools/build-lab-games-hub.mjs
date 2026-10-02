import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import '../lab/shared/games-catalog.js';

const execFileAsync = promisify(execFile);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const destination = process.argv[2];
const { games, modes, format: catalogFormat } = globalThis.GradeCrewGames;
const brandIcon = 'assets/gradecrew/brand-icon-v1.svg';
if (!destination || !path.isAbsolute(destination)) throw new Error('An absolute build directory is required.');
const buildRoot = path.resolve(destination);
if (buildRoot === root || buildRoot.startsWith(root + path.sep)) throw new Error('Build outside the repository to keep sources separate.');
const output = path.join(buildRoot, 'public');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('Build directory must be empty.');

const ids = new Set();
for (const game of games) {
  if (!/^[a-z0-9-]+$/.test(game.id) || ids.has(game.id)) throw new Error('Game IDs must be unique safe folder names.');
  if (!/^tools\/build-lab-[a-z0-9-]+\.mjs$/.test(game.buildScript)) throw new Error('Unexpected game build script.');
  if (!game.modes.length || game.modes.some(mode => !modes.some(item => item.id === mode))) throw new Error('Unknown game mode.');
  ids.add(game.id);
}
async function copyFile(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}
async function hashTree(dir, prefix = '') {
  const hashes = {};
  const entries = (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name), rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(hashes, await hashTree(full, rel));
    else if (rel !== 'lab-release.json') hashes[rel] = createHash('sha256').update(await fs.readFile(full)).digest('hex');
  }
  return hashes;
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function navigation(game) {
  const links = games.map(item => '<li><a data-gc-switch="' + item.id + '" href="../' + item.id + '/"' +
    (item.id === game.id ? ' aria-current="page"' : '') + '>' + escapeHtml(item.name) + '</a></li>').join('');
  return '<header class="gc-games-nav" data-gc-game="' + game.id + '">' +
    '<nav class="gc-breadcrumb" aria-label="Spielnavigation"><img class="gc-brand-icon" src="../' + brandIcon + '" width="36" height="36" alt=""><a class="gc-games-home" href="../">← Alle Spiele</a><span class="gc-separator" aria-hidden="true">/</span>' +
    '<span class="gc-current-game"><strong>' + escapeHtml(game.name) + '</strong><small>' + escapeHtml(game.subject) + '</small></span></nav>' +
    '<details class="gc-games-switch"><summary>Spiele wechseln</summary><ul>' + links + '</ul></details></header>';
}
const leaveDialog = '<dialog id="gcLeaveDialog" class="gc-leave-dialog" aria-labelledby="gcLeaveTitle"><h2 id="gcLeaveTitle">Runde verlassen?</h2><p></p><form method="dialog"><button value="stay" autofocus>Hier bleiben</button><button value="leave">Spiel wechseln</button></form></dialog>';
for (const name of ['index.html', 'styles.css', 'app.js']) {
  await copyFile(path.join(root, 'lab', 'games-hub', name), path.join(output, name));
}
const sharedFiles = ['games-catalog.js', 'game-shell.css', 'game-shell.js', 'brand-core.css'];
for (const name of sharedFiles) await copyFile(path.join(root, 'lab', 'shared', name), path.join(output, 'shared', name));
await copyFile(path.join(root, brandIcon), path.join(output, brandIcon));

for (const game of games) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'gradecrew-game-build.'));
  try {
    // The exact canonical frontend build includes each game's current addons.
    await execFileAsync(process.execPath, [path.join(root, game.buildScript), temporary], { cwd: root });
    const gameDir = path.join(output, game.id);
    await fs.cp(path.join(temporary, 'public'), gameDir, { recursive: true });
    const indexPath = path.join(gameDir, 'index.html');
    let html = await fs.readFile(indexPath, 'utf8');
    const headerPattern = /<header\b[^>]*>[\s\S]*?<\/header>/i;
    if (!headerPattern.test(html)) throw new Error('Game header missing: ' + game.id);
    if (html.includes('data-gc-game')) throw new Error('Game shell already injected: ' + game.id);
    for (const mode of game.modes) {
      if (!html.includes(game.entry.modeAttribute + '="' + mode + '"')) throw new Error('Mode entry missing: ' + game.id + '/' + mode);
    }
    html = html.replace(headerPattern, navigation(game))
      .replace('</head>', '<link rel="icon" href="../' + brandIcon + '" type="image/svg+xml"><link rel="stylesheet" href="../shared/game-shell.css"><link rel="stylesheet" href="../shared/brand-core.css"></head>')
      .replace('</body>', leaveDialog + '<script src="../shared/games-catalog.js"></script><script src="../shared/game-shell.js"></script></body>');
    await fs.writeFile(indexPath, html);
    const releasePath = path.join(gameDir, 'lab-release.json');
    const release = JSON.parse(await fs.readFile(releasePath, 'utf8'));
    // The original child manifest must be refreshed after adding the shared shell.
    release.hubShellFormat = 2;
    release.brandCore = { icon: '../' + brandIcon };
    release.files = await hashTree(gameDir);
    release.sharedFiles = await hashTree(path.join(output, 'shared'));
    await fs.writeFile(releasePath, JSON.stringify(release, null, 2) + '\n');
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}
async function validateReferences(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { await validateReferences(full); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = await fs.readFile(full, 'utf8');
    for (const match of html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]+)"/gi)) {
      const reference = match[1];
      if (/^(?:https?:|data:|\/\/)/.test(reference)) continue;
      const target = path.resolve(path.dirname(full), reference.split(/[?#]/)[0]);
      if (!target.startsWith(output + path.sep)) throw new Error('Asset escapes the build: ' + reference);
      await fs.access(target);
    }
  }
}
await validateReferences(output);
await fs.writeFile(path.join(output, 'lab-release.json'), JSON.stringify({
  experiment: 'gradecrew-games-hub', format: 5, catalogFormat,
  games: games.map(game => game.id), modes: modes.map(mode => mode.id),
  brandCore: { icon: brandIcon },
  features: { sharedNavigation: true, directModeEntry: true, gameFilters: true, favorites: true, centralJoin: true, canonicalGameBuilds: true, fastQuizRounding: true, gradeCrewBrandCore: true },
  files: await hashTree(output)
}, null, 2) + '\n');
await fs.writeFile(path.join(buildRoot, 'firebase.json'), JSON.stringify({
  hosting: {
    site: 'hausaufgabe-staging', public: 'public', ignore: ['**/.*'],
    headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
  }
}, null, 2) + '\n');
console.log('GradeCrew Games structure verified: ' + games.map(game => game.name).join(' + ') + '.');