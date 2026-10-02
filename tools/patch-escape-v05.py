from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(path, old, new):
    text = read(path)
    if new in text:
        return
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one anchor, found {count}: {old[:100]!r}')
    write(path, text.replace(old, new, 1))


def replace_between(path, start, end, replacement):
    text = read(path)
    a = text.find(start)
    b = text.find(end, a + len(start)) if a >= 0 else -1
    if a < 0 or b < 0:
        if replacement in text:
            return
        raise SystemExit(f'{path}: block markers missing: {start!r} -> {end!r}')
    write(path, text[:a] + replacement + text[b:])


# ---------------------------------------------------------------------------
# HTML: shared GradeCrew visual language + teacher-first launch flow.
# ---------------------------------------------------------------------------
replace_once(
    'lab/escape-room/index.html',
    '  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="escape-v2.css">',
    '  <link rel="stylesheet" href="gradecrew-brand.css">\n  <link rel="stylesheet" href="crew-clay.css">\n  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="escape-v2.css">'
)
replace_once(
    'lab/escape-room/index.html',
    '<button id="startBtn" class="primaryButton" data-open-mode="practice" type="button">Escape starten</button>',
    '<button id="startBtn" class="primaryButton" data-open-mode="practice" type="button">Escape vorbereiten</button>'
)
replace_once(
    'lab/escape-room/index.html',
    '<button id="teacherPreviewBtn" class="secondaryButton" type="button">Lehrer-Vorschau</button>',
    '<button id="teacherPreviewBtn" class="secondaryButton" type="button" hidden aria-hidden="true" tabindex="-1">Lehrer-Vorschau</button>'
)
replace_once(
    'lab/escape-room/index.html',
    '<p class="quiet">Keine Vorbereitung im Klassenzimmer. Alles passiert digital.</p>',
    '<p class="quiet">Zuerst Aufgaben erstellen oder kurz prüfen. Gestartet wird anschließend im Lehrerbereich.</p>'
)
replace_once(
    'lab/escape-room/index.html',
    '<img class="cocoExplorerArt" src="assets/gradecrew/penguin-guide.svg" alt="">',
    '<img class="cocoExplorerArt gcClayCharacter" src="assets/gradecrew/penguin-guide.svg#pose-5" alt="">'
)
replace_once(
    'lab/escape-room/index.html',
    '<img class="cocoHelpArt" src="assets/gradecrew/penguin-guide.svg" alt="">',
    '<img class="cocoHelpArt gcClayCharacter" src="assets/gradecrew/penguin-guide.svg#pose-4" alt="">'
)
replace_once(
    'lab/escape-room/index.html',
    '<span class="eyebrow">LEHRER-VORSCHAU · LAB</span>',
    '<span class="eyebrow">LEHRERBEREICH · VORSCHAU</span>'
)
replace_once(
    'lab/escape-room/index.html',
    '<h2 id="teacherTitle">Die verriegelte Schule</h2>\n      <div id="preflightStatus" class="preflightStatus"></div>',
    '<h2 id="teacherTitle">Escape vorbereiten</h2>\n      <div class="teacherFlowIntro" aria-label="Ablauf vor dem Start"><span><strong>1</strong> Aufgaben festlegen</span><span><strong>2</strong> Kurz prüfen</span><span><strong>3</strong> Escape starten</span></div>\n      <div id="preflightStatus" class="preflightStatus"></div>'
)
replace_once(
    'lab/escape-room/index.html',
    '      <section class="teacherSection" aria-labelledby="teacherQuestionsTitle">\n        <div class="teacherSectionHead">\n          <div><h3 id="teacherQuestionsTitle">Alle Lernfragen</h3><p>Frage, Lösung, Hinweis, Lernhilfe und Transferaufgabe auf einen Blick.</p></div>\n        </div>\n        <div id="teacherQuestions" class="teacherQuestions"></div>\n      </section>\n    </form>\n  </dialog>',
    '      <section class="teacherSection" aria-labelledby="teacherQuestionsTitle">\n        <div class="teacherSectionHead">\n          <div><h3 id="teacherQuestionsTitle">Alle Lernfragen</h3><p>Frage, Lösung, Hinweis, Lernhilfe und Transferaufgabe auf einen Blick.</p></div>\n        </div>\n        <div id="teacherQuestions" class="teacherQuestions"></div>\n      </section>\n\n      <div class="teacherLaunchBar">\n        <div><strong>Alles geprüft?</strong><span>Das Spiel startet erst von hier aus.</span></div>\n        <button id="teacherStartBtn" class="primaryButton" type="button">Escape mit diesen Aufgaben starten</button>\n      </div>\n    </form>\n  </dialog>'
)
replace_once(
    'lab/escape-room/index.html',
    '  <script src="escape-coco-ai.js"></script>\n',
    '  <script src="escape-coco-ai.js"></script>\n  <script src="escape-teacher-flow.js"></script>\n'
)

# ---------------------------------------------------------------------------
# Coco/AI card: no second login in the lab. The real GradeCrew host supplies
# the already-authenticated bridge later. No fake unauthenticated backend call.
# ---------------------------------------------------------------------------
replace_once('lab/escape-room/escape-coco-ai.js', "  const COCO_PRIMARY = 'assets/gradecrew/penguin-guide.svg';\n  const COCO_WELCOME = 'assets/gradecrew/penguin-guide-welcome.svg';\n  let firebaseRuntimePromise = null;", "  const COCO_EXPLORER = 'assets/gradecrew/penguin-guide.svg#pose-5';\n  const COCO_HELP = 'assets/gradecrew/penguin-guide.svg#pose-4';\n  const COCO_WELCOME = 'assets/gradecrew/penguin-guide-welcome.svg#pose-1';")
replace_once('lab/escape-room/escape-coco-ai.js', "if (explorer && !explorer.querySelector('img')) explorer.replaceChildren(cocoImage(COCO_PRIMARY, 'cocoExplorerArt'));", "if (explorer && !explorer.querySelector('img')) explorer.replaceChildren(cocoImage(COCO_EXPLORER, 'cocoExplorerArt gcClayCharacter'));")
replace_once('lab/escape-room/escape-coco-ai.js', "if (avatar) avatar.replaceChildren(cocoImage(COCO_PRIMARY, 'cocoHelpArt'));", "if (avatar) avatar.replaceChildren(cocoImage(COCO_HELP, 'cocoHelpArt gcClayCharacter'));")
replace_between(
    'lab/escape-room/escape-coco-ai.js',
    '  async function firebaseRuntime() {',
    '  function setStatus(text, kind = \'\') {',
    "  function setStatus(text, kind = '') {"
)
replace_between(
    'lab/escape-room/escape-coco-ai.js',
    '  async function refreshAuthUi() {',
    '  async function generate() {',
    "  async function callGenerator(payload) {\n    if (window.GradeCrewEscapeAiBridge?.generateTest) return window.GradeCrewEscapeAiBridge.generateTest(payload);\n    throw new Error('gradecrew-ai-bridge-unavailable');\n  }\n\n  async function generate() {"
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    "    } catch (error) {\n      const unauthenticated = String(error?.message || '').includes('not-authenticated') || String(error?.code || '').includes('unauthenticated');\n      setStatus(unauthenticated ? 'Bitte zuerst mit deinem GradeCrew-Lehrerkonto anmelden.' : `KI-Erstellung fehlgeschlagen: ${error?.message || 'Unbekannter Fehler'}`, 'error');\n      await refreshAuthUi();\n    } finally {",
    "    } catch (error) {\n      const bridgeMissing = String(error?.message || '').includes('gradecrew-ai-bridge-unavailable');\n      setStatus(bridgeMissing ? 'Die echte GradeCrew-KI wird erst in der integrierten Lehreransicht über deine bestehende Sitzung verbunden. Im Lab ist dafür bewusst keine Extra-Anmeldung nötig.' : `KI-Erstellung fehlgeschlagen: ${error?.message || 'Unbekannter Fehler'}`, 'error');\n    } finally {"
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    '''      <div id="teacherAiLogin" class="teacherAiLogin">\n        <strong>GradeCrew-Lehrerkonto</strong>\n        <p>Im später integrierten GradeCrew entfällt diese Extra-Anmeldung. Sie ist nur für den eigenständigen Escape-Preview nötig.</p>\n        <div class="teacherAiLoginRow">\n          <label>E-Mail<input id="teacherAiEmail" type="email" autocomplete="username"></label>\n          <label>Passwort<input id="teacherAiPassword" type="password" autocomplete="current-password"></label>\n          <button id="teacherAiLoginBtn" class="secondaryButton" type="button">Anmelden</button>\n        </div>\n      </div>\n      <div id="teacherAiAccount" class="teacherAiAccount"></div>''',
    '''      <div id="teacherAiConnection" class="teacherAiAccount"></div>'''
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    '<div><h3>Aufgaben mit KI erstellen</h3><p>Nur das Nötigste: Fach, Klasse und Thema. Coco lässt die bestehende GradeCrew-KI 8 Lernaufgaben plus passende Transferaufgaben vorbereiten.</p></div>',
    '<div><h3>Aufgaben mit KI erstellen</h3><p>Nur Fach, Klasse, Thema und optional ein Wunsch. In GradeCrew nutzt diese Karte später automatisch die bereits angemeldete Lehrersitzung – ohne zweite Anmeldung.</p></div>'
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    '<div class="teacherAiCoco"><img src="${COCO_WELCOME}" alt="Coco"></div>',
    '<div class="teacherAiCoco"><img class="gcClayCharacter" src="${COCO_WELCOME}" alt="Coco"></div>'
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    "    overview.insertAdjacentElement('afterend', card);\n    $('teacherAiLoginBtn').onclick = login;\n    $('teacherAiGenerateBtn').onclick = generate;\n    refreshAuthUi();",
    "    overview.insertAdjacentElement('afterend', card);\n    $('teacherAiGenerateBtn').onclick = generate;\n    updateConnectionUi();"
)
# dead login styles are removed so the standalone preview has no auth surface at all.
text = read('lab/escape-room/escape-coco-ai.js')
text = text.replace(',.teacherAiLogin input', '')
for line in [
    '      .teacherAiLogin{margin:.75rem 0;padding:.75rem;border-radius:13px;background:#fff;border:1px solid #dfe6f1}\n',
    '      .teacherAiLogin strong{display:block;margin-bottom:.15rem}\n',
    '      .teacherAiLogin p{margin:.1rem 0 .65rem;color:#65758b;font-size:.82rem}\n',
    '      .teacherAiLoginRow{display:grid;grid-template-columns:1fr 1fr auto;gap:.55rem;align-items:end}\n',
    '      .teacherAiLoginRow label{display:grid;gap:.25rem;font-size:.75rem;font-weight:700;color:#4b5c73}\n',
]:
    text = text.replace(line, '')
text = text.replace('@media(max-width:720px){.teacherAiGrid{grid-template-columns:1fr}.teacherAiTopic{grid-column:auto}.teacherAiLoginRow{grid-template-columns:1fr}.teacherAiHead', '@media(max-width:720px){.teacherAiGrid{grid-template-columns:1fr}.teacherAiTopic{grid-column:auto}.teacherAiHead')
text = text.replace('      .teacherAiActions .primaryButton{margin:0}\n', '      .teacherAiActions .primaryButton{margin:0}\n      .teacherAiActions .primaryButton:disabled{opacity:.55;cursor:not-allowed}\n')
write('lab/escape-room/escape-coco-ai.js', text)

# Add bridge availability UI right before the card builder.
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    '  function buildTeacherAiCard() {',
    '''  function updateConnectionUi() {\n    const button = $('teacherAiGenerateBtn');\n    const status = $('teacherAiConnection');\n    if (!button || !status) return;\n    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);\n    button.disabled = !connected;\n    status.textContent = connected\n      ? '✓ GradeCrew-KI über die vorhandene Lehrersitzung verbunden.'\n      : 'Lab-Vorschau: keine Extra-Anmeldung. Die echte KI wird beim Einbau in GradeCrew über die vorhandene Lehrersitzung verbunden. Die Beispielaufgaben können jetzt schon geprüft und gespielt werden.';\n  }\n\n  function buildTeacherAiCard() {'''
)
replace_once(
    'lab/escape-room/escape-coco-ai.js',
    "    window.addEventListener('gradecrew:escape-teacher-rendered', updateProfileDisplay);",
    "    window.addEventListener('gradecrew:escape-teacher-rendered', updateProfileDisplay);\n    window.addEventListener('gradecrew:escape-ai-bridge-ready', updateConnectionUi);"
)

# ---------------------------------------------------------------------------
# New flow controller. It preserves the already-tested internal start handler,
# but makes it reachable only from the teacher preview.
# ---------------------------------------------------------------------------
flow = r'''(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const startButton = $('startBtn');
  const legacyPreviewButton = $('teacherPreviewBtn');
  const teacherDialog = $('teacherDialog');
  const teacherStartButton = $('teacherStartBtn');
  const gameView = $('gameView');

  if (!startButton || !legacyPreviewButton || !teacherDialog || !teacherStartButton || !gameView) return;

  const directStart = startButton.onclick;
  const openTeacherPreview = legacyPreviewButton.onclick;

  startButton.textContent = 'Escape vorbereiten';
  legacyPreviewButton.hidden = true;
  legacyPreviewButton.setAttribute('aria-hidden', 'true');
  legacyPreviewButton.tabIndex = -1;

  startButton.onclick = () => {
    if (typeof openTeacherPreview === 'function') openTeacherPreview.call(legacyPreviewButton);
    window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.preparation_opened' } }));
  };

  teacherStartButton.onclick = () => {
    if (typeof directStart !== 'function') return;
    directStart.call(startButton);
    if (!gameView.hidden) {
      teacherDialog.close();
      window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.started_from_preview' } }));
    }
  };
})();
'''
write('lab/escape-room/escape-teacher-flow.js', flow)

# Small layout additions, scoped to the teacher flow.
styles_path = 'lab/escape-room/styles.css'
styles = read(styles_path)
flow_css = r'''

/* v0.5: teacher-first launch, aligned with the shared GradeCrew working surface. */
.teacherFlowIntro{display:flex;gap:.55rem;flex-wrap:wrap;margin:.25rem 0 1rem}
.teacherFlowIntro span{display:inline-flex;align-items:center;gap:.42rem;padding:.45rem .65rem;border:1px solid var(--line,#dfe5ec);border-radius:999px;background:#f7f9fc;color:#53647c;font-size:.8rem;font-weight:700}
.teacherFlowIntro strong{display:grid;place-items:center;width:1.35rem;height:1.35rem;border-radius:50%;background:var(--primary,#285ac9);color:#fff;font-size:.72rem}
.teacherLaunchBar{position:sticky;bottom:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:1.1rem -.2rem -.2rem;padding:1rem;border:1px solid #cddaf0;border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 -8px 24px rgba(31,56,97,.08);backdrop-filter:blur(10px)}
.teacherLaunchBar div{display:grid;gap:.12rem}.teacherLaunchBar strong{font-size:.95rem}.teacherLaunchBar span{color:#68788d;font-size:.78rem}.teacherLaunchBar .primaryButton{margin:0;white-space:nowrap}
@media(max-width:680px){.teacherLaunchBar{position:static;align-items:stretch;flex-direction:column}.teacherLaunchBar .primaryButton{width:100%;white-space:normal}}
'''
if 'v0.5: teacher-first launch' not in styles:
    styles += flow_css
write(styles_path, styles)

# ---------------------------------------------------------------------------
# Build: consume the shared root-level brand/clay files and no longer ship a
# standalone Firebase auth config, because the lab does not authenticate.
# ---------------------------------------------------------------------------
replace_once(
    'tools/build-lab-escape-room.mjs',
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'README.md'];",
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-teacher-flow.js', 'README.md'];"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "await fs.copyFile(path.join(root, 'firebase-config.staging.js'), path.join(output, 'firebase-config.js'));\nawait fs.mkdir(path.join(output, 'assets', 'gradecrew'), { recursive: true });",
    "for (const sharedCss of ['gradecrew-brand.css', 'crew-clay.css']) {\n  await fs.copyFile(path.join(root, sharedCss), path.join(output, sharedCss));\n}\nawait fs.mkdir(path.join(output, 'assets', 'gradecrew'), { recursive: true });"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js']) {",
    "for (const reference of ['gradecrew-brand.css', 'crew-clay.css', 'styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-teacher-flow.js']) {"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const name of ['firebase-config.js', 'assets/gradecrew/penguin-guide.svg', 'assets/gradecrew/penguin-guide-welcome.svg']) {",
    "for (const name of ['gradecrew-brand.css', 'crew-clay.css', 'assets/gradecrew/penguin-guide.svg', 'assets/gradecrew/penguin-guide-welcome.svg']) {"
)
replace_once('tools/build-lab-escape-room.mjs', "version: '0.4.0'", "version: '0.5.0'")
replace_once(
    'tools/build-lab-escape-room.mjs',
    '    cocoCanonicalArtwork: true,\n    teacherAiGeneration: true,',
    '    cocoCanonicalArtwork: true,\n    sharedGradeCrewBrandSystem: true,\n    teacherFirstLaunch: true,\n    teacherStandaloneLogin: false,\n    teacherAiRequiresHostBridge: true,\n    teacherAiGeneration: true,'
)
replace_once('tools/build-lab-escape-room.mjs', "console.log('Escape Room MVP build verified: locked-school lab v0.4.0.');", "console.log('Escape Room MVP build verified: locked-school lab v0.5.0.');")

# ---------------------------------------------------------------------------
# Tests: exact shared Coco sheet, no login surface, and teacher-first start.
# ---------------------------------------------------------------------------
replace_once(
    'tools/games/escape-coco-ai.test.cjs',
    "    'escape-coco-ai.js'\n  ]) {",
    "    'escape-coco-ai.js',\n    'escape-teacher-flow.js'\n  ]) {"
)
replace_once(
    'tools/games/escape-coco-ai.test.cjs',
    "    assert.match(d.querySelector('.remyAvatar img').getAttribute('src'), /assets\\/gradecrew\\/penguin-guide\\.svg/);\n    assert.match(d.querySelector('#explorer img').getAttribute('src'), /assets\\/gradecrew\\/penguin-guide\\.svg/);",
    "    assert.match(d.querySelector('.remyAvatar img').getAttribute('src'), /penguin-guide\\.svg#pose-4/);\n    assert.match(d.querySelector('#explorer img').getAttribute('src'), /penguin-guide\\.svg#pose-5/);\n    const cocoSvg = fs.readFileSync(path.join(root, 'assets', 'gradecrew', 'penguin-guide.svg'), 'utf8');\n    assert.match(cocoSvg, /<view id=\"pose-1\"/);\n    assert.match(cocoSvg, /<view id=\"pose-6\"/);\n    assert.doesNotMatch(cocoSvg, /Reduzierte Editorial-Illustration/);"
)
replace_once(
    'tools/games/escape-coco-ai.test.cjs',
    "    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /8 Escape-Aufgaben/);",
    "    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /8 Escape-Aufgaben/);\n    assert.equal(d.getElementById('teacherAiLogin'), null);\n    assert.equal(d.getElementById('teacherAiEmail'), null);\n    assert.equal(d.getElementById('teacherAiPassword'), null);\n    assert.ok(d.getElementById('teacherAiConnection'));"
)
# Append a dedicated launch-order regression test.
test_path = 'tools/games/escape-coco-ai.test.cjs'
tests = read(test_path)
extra_test = r'''

test('teacher preparation is the only new-run entry point before the Escape starts', () => {
  const { w, d } = openEscape();
  try {
    const start = d.getElementById('startBtn');
    const preview = d.getElementById('teacherPreviewBtn');
    const teacherStart = d.getElementById('teacherStartBtn');
    assert.equal(start.textContent.trim(), 'Escape vorbereiten');
    assert.equal(preview.hidden, true);
    assert.ok(teacherStart);
    assert.equal(d.getElementById('gameView').hidden, true);

    start.click();
    assert.equal(d.getElementById('teacherDialog').open, true);
    assert.equal(d.getElementById('gameView').hidden, true);

    teacherStart.click();
    assert.equal(d.getElementById('gameView').hidden, false);
    assert.equal(d.getElementById('teacherDialog').open, false);
  } finally {
    w.close();
  }
});

test('standalone Escape AI client has no Firebase login dependency', () => {
  const sourceJs = fs.readFileSync(path.join(source, 'escape-coco-ai.js'), 'utf8');
  assert.doesNotMatch(sourceJs, /firebase-auth/);
  assert.doesNotMatch(sourceJs, /signInWithEmailAndPassword/);
  assert.doesNotMatch(sourceJs, /teacherAiLogin/);
  assert.match(sourceJs, /GradeCrewEscapeAiBridge/);
});
'''
if 'teacher preparation is the only new-run entry point' not in tests:
    tests += extra_test
write(test_path, tests)

# ---------------------------------------------------------------------------
# Docs: v0.5 truth, no misleading login promise.
# ---------------------------------------------------------------------------
replace_once('lab/escape-room/README.md', '# GradeCrew Escape Room – Lern-MVP v0.4', '# GradeCrew Escape Room – Lern-MVP v0.5')
replace_once(
    'lab/escape-room/README.md',
    'Für den eigenständigen Preview meldet sich die Lehrkraft einmal mit dem GradeCrew-Lehrerkonto an; in der späteren Haupt-App kann dieselbe UI über `GradeCrewEscapeAiBridge` die bestehende Sitzung nutzen.',
    'Der eigenständige Preview zeigt bewusst **keine zweite Anmeldung**. Die echte KI-Erstellung wird erst in der GradeCrew-Lehreransicht über `GradeCrewEscapeAiBridge` und die dort bereits vorhandene Sitzung aktiviert. Im Lab bleiben die Beispielaufgaben vollständig prüf- und spielbar.'
)
readme = read('lab/escape-room/README.md')
v05 = r'''

## v0.5 – gemeinsamer Coco + Lehrer zuerst

- Coco wird nicht mehr aus der alten Escape-Kopie gestaltet, sondern aus dem freigegebenen Shared-Design-System übernommen.
- `penguin-guide.svg` nutzt die sechs offiziellen Clay-Posen; Escape verwendet `#pose-1` für Begrüßung, `#pose-4` für Hilfe und `#pose-5` beim Erkunden.
- `gradecrew-brand.css` und `crew-clay.css` werden im isolierten Build aus der gemeinsamen GradeCrew-Wurzel übernommen. Escape-spezifische Styles liegen danach und dürfen nur Spielspezifika ergänzen.
- Neue Runden starten nicht mehr direkt von der Startseite: **Escape vorbereiten → Lehrerbereich → Aufgaben erstellen/prüfen → Escape starten**.
- Der eigenständige Lab-Preview enthält keine E-Mail-/Passwort-Anmeldung mehr und ruft die geschützte GradeCrew-KI nicht anonym auf.
- Die Generator-UI und der 16-Fragen-Vertrag bleiben vorbereitet. Erst wenn der Host `GradeCrewEscapeAiBridge` mit der bereits angemeldeten Lehrersitzung bereitstellt, wird der KI-Button aktiv.
- Production bleibt unverändert.
'''
if '## v0.5 – gemeinsamer Coco + Lehrer zuerst' not in readme:
    readme += v05
write('lab/escape-room/README.md', readme)

handoff_path = 'workstreams/escape-room-mvp.md'
handoff = read(handoff_path)
handoff = handoff.replace('- eigenständiger Escape-Preview: Lehrkraft meldet sich einmal mit ihrem GradeCrew-Lehrerkonto an\n', '- v0.4-Historie: der eigenständige Preview verlangte kurzzeitig eine Extra-Anmeldung; diese wird in v0.5 wieder entfernt\n')
v05_handoff = r'''

## v0.5 – Shared Design + Lehrer-first (in Arbeit)

Anforderung vom 02.10.2026:

- exakt derselbe Coco wie im gemeinsamen GradeCrew-Designsystem, keine alte Escape-Pinguin-Kopie
- keine Extra-Anmeldung im eigenständigen Escape-Lab
- keine neue Runde direkt von der Startseite
- Reihenfolge: **Lehrerbereich/Vorschau → Aufgaben festlegen bzw. prüfen → Start**

Technische Entscheidung:

- die offiziellen Coco-/Clay-Dateien werden unverändert aus `feature/shared-gradecrew-design-system` übernommen
- `gradecrew-brand.css` bleibt gemeinsame Basissprache; `crew-clay.css` wird ebenfalls aus dem Shared-Design-System übernommen
- echte KI bleibt geschützt und wird im Standalone-Lab nicht durch anonyme Zugriffe umgangen
- `GradeCrewEscapeAiBridge` bleibt der Integrationspunkt für die später bereits angemeldete GradeCrew-Lehrersitzung
- bestehende Escape-Spiel-/Lernlogik und der parallele Tutor-Cost-Guard-Branch werden nicht strukturell umgebaut

**Prüfstatus:** wird durch den v0.5-Patch-Workflow getestet; danach separater Escape-only Staging-Deploy. Production bleibt unverändert.
'''
if '## v0.5 – Shared Design + Lehrer-first' not in handoff:
    handoff += v05_handoff
write(handoff_path, handoff)

print('Escape v0.5 patch applied.')
