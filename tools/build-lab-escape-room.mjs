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

const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'README.md'];
for (const name of files) await fs.copyFile(path.join(source, name), path.join(output, name));

const html = await fs.readFile(path.join(output, 'index.html'), 'utf8');
for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js']) {
  if (!html.includes(reference)) throw new Error(`Missing HTML reference: ${reference}`);
  await fs.access(path.join(output, reference));
}
for (const marker of ['Die verriegelte Schule', 'Lehrer-Vorschau', 'data-open-mode="practice"', 'gameView', 'Frag Remy']) {
  if (!html.includes(marker)) throw new Error(`Escape Room HTML check failed: ${marker}`);
}

const app = await fs.readFile(path.join(output, 'app.js'), 'utf8');
for (const marker of [
  'gradecrew:escape-event',
  'localStorage',
  'validateWorldDefinition',
  'game.completed',
  'item.used',
  'locker-sequence',
  'key-sequence',
  'board-pattern',
  'door-code',
  'clueReviewProgress',
  'renderPrimaryAnswer',
  'evaluatePrimaryAnswer',
  'remediation.started',
  'transfer.answered',
  'GradeCrewEscapeIntegration'
]) {
  if (!app.includes(marker)) throw new Error(`Escape Room app check failed: ${marker}`);
}

const tutor = await fs.readFile(path.join(output, 'escape-tutor.js'), 'utf8');
for (const marker of ['sessionCache', 'GradeCrewTutorBridge', 'knowledgeHits', 'externalCalls']) {
  if (!tutor.includes(marker)) throw new Error(`Escape tutor check failed: ${marker}`);
}

const adapter = await fs.readFile(path.join(output, 'gradecrew-question-adapter.js'), 'utf8');
for (const marker of [
  'GradeCrewEscapeQuestionAdapter',
  "'single'",
  "'dropdown'",
  "'truefalse'",
  "'text'",
  "'number'",
  'manual_review_required',
  'missing_accepted_answers',
  'invalid_numeric_answer',
  'visual_dependency'
]) {
  if (!adapter.includes(marker)) throw new Error(`GradeCrew Escape adapter check failed: ${marker}`);
}

const builder = await fs.readFile(path.join(output, 'gradecrew-escape-builder.js'), 'utf8');
for (const marker of ['GradeCrewEscapeBuilder', 'teacherReview', 'launchPayload', 'validateWorldDefinition', 'runtime_missing']) {
  if (!builder.includes(marker)) throw new Error(`GradeCrew Escape builder check failed: ${marker}`);
}

const gameData = await fs.readFile(path.join(output, 'escape-data.js'), 'utf8');
for (const marker of [
  "id: 'q1'",
  "id: 'q8'",
  "classroomDoorCode: '784'",
  'supportedQuestionTypes',
  'remediationPolicy',
  'validateWorldDefinition'
]) {
  if (!gameData.includes(marker)) throw new Error(`Escape Room data check failed: ${marker}`);
}

const hashes = {};
for (const name of files) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');

await fs.writeFile(path.join(output, 'lab-release.json'), JSON.stringify({
  experiment: 'escape-room-locked-school',
  format: 3,
  version: '0.2.1',
  files: hashes,
  features: {
    deterministicWorld: true,
    questionSlots: 8,
    localResume: true,
    preflight: true,
    remediationLoop: true,
    tutorLocalCache: true,
    tutorExternalBridge: false,
    antiGuessGuard: true,
    teacherQuestionEditing: true,
    gradeCrewQuestionAdapter: true,
    gradeCrewPreparationBuilder: true,
    gradeCrewAdapterTypes: ['single', 'dropdown', 'truefalse', 'text', 'number'],
    gradeCrewPlannedTypes: [],
    telemetryUpload: false,
    teacherAuth: false
  }
}, null, 2) + '\n');

await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({
  hosting: {
    site: 'hausaufgabe-staging',
    public: 'public',
    ignore: ['**/.*'],
    headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }]
  }
}, null, 2) + '\n');

console.log('Escape Room MVP build verified: locked-school v0.2.1.');