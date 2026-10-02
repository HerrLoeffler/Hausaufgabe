from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(path, old, new):
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one anchor, found {count}: {old[:120]!r}')
    write(path, text.replace(old, new, 1))


js = 'lab/escape-room/escape-coco-ai.js'

# Remy owns creation. Coco remains the in-game guide/helper.
replace_once(
    js,
    "  const COCO_WELCOME = 'assets/gradecrew/penguin-guide-welcome.svg#pose-1';\n  let activeProfile = null;",
    "  const REMY_CREATE = 'assets/gradecrew/clay-remy-writing.svg';\n  let activeProfile = null;"
)

text = read(js)
text = text.replace('.teacherAiCoco', '.teacherAiRemy')
text = text.replace('teacherAiCoco', 'teacherAiRemy')
text = text.replace(
    "      .teacherAiActions .primaryButton:disabled{opacity:.55;cursor:not-allowed}\n",
    "      .teacherAiActions .primaryButton:disabled{opacity:.55;cursor:not-allowed}\n"
    "      .teacherAiVoiceRow{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap;margin-top:.7rem}\n"
    "      .teacherAiMic.listening{background:#fff0f0;border-color:#e25b5b;color:#a81f1f}\n"
    "      .teacherAiVoiceStatus{font-size:.76rem;color:#607189}\n"
)
text = text.replace(
    "@media(max-width:720px){.teacherAiGrid{grid-template-columns:1fr}.teacherAiTopic{grid-column:auto}.teacherAiHead{grid-template-columns:58px 1fr}.teacherAiRemy{width:58px;height:58px}.teacherAiRemy img{width:54px;height:54px}}",
    "@media(max-width:720px){.teacherAiGrid{grid-template-columns:1fr}.teacherAiTopic{grid-column:auto}.teacherAiHead{grid-template-columns:58px 1fr}.teacherAiRemy{width:58px;height:58px}.teacherAiRemy img{width:54px;height:54px}.teacherAiVoiceRow{align-items:stretch}.teacherAiMic{width:100%}}"
)
write(js, text)

replace_once(
    js,
    "    setStatus('Coco erstellt 8 Lernaufgaben und passende Transferaufgaben mit der GradeCrew-KI …');\n    try {\n      const result = await callGenerator(generationPayload(settings));",
    "    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);\n    if (!connected) {\n      activeProfile = { subject: settings.subject, grade: settings.grade, topic: settings.topic };\n      updateProfileDisplay();\n      setStatus('✓ Remy hat deine Angaben für die Lab-Vorschau übernommen. Die vorhandenen Beispielaufgaben bleiben unverändert, damit wir keine echte KI-Erstellung vortäuschen. In GradeCrew erzeugt derselbe Button anschließend die neuen 8 Aufgaben.', 'success');\n      window.dispatchEvent(new CustomEvent('gradecrew:escape-event', { detail: { name: 'teacher.remy_preview_prepared', profile: activeProfile } }));\n      return;\n    }\n    setStatus('Remy erstellt 8 Lernaufgaben und passende Transferaufgaben mit der GradeCrew-KI …');\n    try {\n      const result = await callGenerator(generationPayload(settings));"
)

replace_once(
    js,
    "    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);\n    button.disabled = !connected;\n    status.textContent = connected\n      ? '✓ GradeCrew-KI über die vorhandene Lehrersitzung verbunden.'\n      : 'Lab-Vorschau: keine Extra-Anmeldung. Die echte KI wird beim Einbau in GradeCrew über die vorhandene Lehrersitzung verbunden. Die Beispielaufgaben können jetzt schon geprüft und gespielt werden.';",
    "    const connected = Boolean(window.GradeCrewEscapeAiBridge?.generateTest);\n    button.disabled = false;\n    button.textContent = connected ? '✨ Remy: 8 Escape-Aufgaben erstellen' : '✨ Remy-Vorschau vorbereiten';\n    status.textContent = connected\n      ? '✓ Remy ist mit der GradeCrew-KI über die vorhandene Lehrersitzung verbunden.'\n      : 'Lab-Vorschau: Remy ist ohne Extra-Anmeldung bedienbar. Hier übernimmt er deine Angaben; echte neue KI-Aufgaben werden erst über die geschützte GradeCrew-Lehrersitzung erzeugt.';"
)

replace_once(
    js,
    '''      <div class="teacherAiHead">\n        <div class="teacherAiRemy"><img class="gcClayCharacter" src="${COCO_WELCOME}" alt="Coco"></div>\n        <div><h3>Aufgaben mit KI erstellen</h3><p>Nur Fach, Klasse, Thema und optional ein Wunsch. In GradeCrew nutzt diese Karte später automatisch die bereits angemeldete Lehrersitzung – ohne zweite Anmeldung.</p></div>\n      </div>''',
    '''      <div class="teacherAiHead">\n        <div class="teacherAiRemy"><img class="gcClayCharacter" src="${REMY_CREATE}" alt="Remy"></div>\n        <div><h3>Aufgaben mit Remy erstellen</h3><p>Fach, Klasse, Thema und optional ein Wunsch. Remy kümmert sich ums Erstellen; Coco bleibt im Spiel deine Begleitung und Hilfe.</p></div>\n      </div>'''
)

replace_once(
    js,
    '''      <label class="teacherAiNotes">Eigener Wunsch <span style="font-weight:500">(optional)</span><textarea id="teacherAiNotes" maxlength="1200" placeholder="z. B. lebensnahe Aufgaben, keine komplizierten Texte …"></textarea></label>\n      <div class="teacherAiActions"><button id="teacherAiGenerateBtn" class="primaryButton" type="button">✨ 8 Escape-Aufgaben erstellen</button><span class="teacherAiAccount">1 KI-Lauf · Transfer wird automatisch mit vorbereitet</span></div>''',
    '''      <label class="teacherAiNotes">Eigener Wunsch <span style="font-weight:500">(optional)</span><textarea id="teacherAiNotes" maxlength="1200" placeholder="z. B. lebensnahe Aufgaben, keine komplizierten Texte …"></textarea></label>\n      <div class="teacherAiVoiceRow"><button id="teacherAiRemyMic" class="secondaryButton teacherAiMic" type="button">🎙 Mit Remy sprechen</button><span id="teacherAiVoiceStatus" class="teacherAiVoiceStatus">Gesprochene Wünsche landen direkt im Wunschfeld.</span></div>\n      <div class="teacherAiActions"><button id="teacherAiGenerateBtn" class="primaryButton" type="button">✨ Remy: 8 Escape-Aufgaben erstellen</button><span class="teacherAiAccount">1 KI-Lauf · Transfer wird automatisch mit vorbereitet</span></div>'''
)

replace_once(
    js,
    "      <p class=\"teacherAiFineprint\">Die KI erzeugt nur Lerninhalte. Räume, Rätsel, Fortschrittslogik und Anti-Raten-Regeln bleiben fest in GradeCrew. Vor dem Start bitte kurz prüfen.</p>",
    "      <p class=\"teacherAiFineprint\">Remy erzeugt nur Lerninhalte. Räume, Rätsel, Fortschrittslogik und Anti-Raten-Regeln bleiben fest in GradeCrew. Vor dem Start bitte kurz prüfen.</p>"
)

replace_once(
    js,
    "  window.GradeCrewEscapeAiGenerator = Object.freeze({\n    prepareGeneratedTest,\n    generationPayload,\n    correctAnswers,\n    safeTypes\n  });",
    "  const remyGenerator = Object.freeze({\n    prepareGeneratedTest,\n    generationPayload,\n    correctAnswers,\n    safeTypes\n  });\n  window.GradeCrewEscapeRemyGenerator = remyGenerator;\n  window.GradeCrewEscapeAiGenerator = remyGenerator; // compatibility alias"
)

# Real preview dictation reuses the same browser-speech V1 pattern as the shared Crew Assistant.
voice = r'''(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  let recognition = null;
  let listening = false;
  let baseText = '';
  let finalText = '';

  function speechConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function setVoiceStatus(text) {
    const node = $('teacherAiVoiceStatus');
    if (node) node.textContent = text;
  }

  function updateButton() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.classList.toggle('listening', listening);
    button.textContent = listening ? '● Remy hört zu …' : '🎙 Mit Remy sprechen';
    button.setAttribute('aria-pressed', String(listening));
  }

  function stop() {
    listening = false;
    const active = recognition;
    recognition = null;
    try { active?.stop(); } catch {}
    updateButton();
  }

  function applyTranscript(interim = '') {
    const notes = $('teacherAiNotes');
    if (!notes) return;
    notes.value = [baseText, finalText, interim].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 1200);
    notes.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function start() {
    const SpeechRecognition = speechConstructor();
    if (!SpeechRecognition) {
      setVoiceStatus('Diktieren wird von diesem Browser noch nicht unterstützt. In GradeCrew bleibt dafür derselbe Remy-/Voice-Vertrag vorgesehen.');
      return;
    }

    const notes = $('teacherAiNotes');
    baseText = String(notes?.value || '').trim();
    finalText = '';
    listening = true;
    updateButton();
    setVoiceStatus('Sprich deinen Wunsch. Noch einmal auf den roten Button tippen beendet das Diktat.');

    const active = new SpeechRecognition();
    recognition = active;
    active.lang = 'de-DE';
    active.interimResults = true;
    active.continuous = true;
    active.maxAlternatives = 1;

    active.onresult = event => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = String(event.results[index][0]?.transcript || '').trim();
        if (!transcript) continue;
        if (event.results[index].isFinal) finalText = `${finalText} ${transcript}`.trim();
        else interim = `${interim} ${transcript}`.trim();
      }
      applyTranscript(interim);
    };

    active.onerror = event => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        setVoiceStatus('Remy bekommt gerade keinen Mikrofonzugriff. Prüfe bitte die Browser-Freigabe.');
        stop();
      }
    };

    active.onend = () => {
      if (recognition === active) recognition = null;
      if (!listening) return updateButton();
      listening = false;
      applyTranscript();
      updateButton();
      setVoiceStatus(finalText ? '✓ Remy hat deinen gesprochenen Wunsch übernommen.' : 'Diktat beendet.');
    };

    try { active.start(); }
    catch {
      recognition = null;
      listening = false;
      updateButton();
      setVoiceStatus('Das Mikrofon konnte nicht gestartet werden.');
    }
  }

  function toggle() {
    if (listening) {
      stop();
      applyTranscript();
      setVoiceStatus(finalText ? '✓ Remy hat deinen gesprochenen Wunsch übernommen.' : 'Diktat beendet.');
      return;
    }
    start();
  }

  function boot() {
    const button = $('teacherAiRemyMic');
    if (!button) return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', toggle);
    window.addEventListener('pagehide', stop, { once: true });
  }

  boot();
})();
'''
write('lab/escape-room/escape-remy-voice.js', voice)

# Load the Remy voice adapter after the creation card exists.
replace_once(
    'lab/escape-room/index.html',
    '  <script src="escape-coco-ai.js"></script>\n  <script src="escape-teacher-flow.js"></script>',
    '  <script src="escape-coco-ai.js"></script>\n  <script src="escape-remy-voice.js"></script>\n  <script src="escape-teacher-flow.js"></script>'
)

# Build: include Remy voice + exact shared Remy artwork, bump lab manifest.
build = 'tools/build-lab-escape-room.mjs'
replace_once(
    build,
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-teacher-flow.js', 'README.md'];",
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-remy-voice.js', 'escape-teacher-flow.js', 'README.md'];"
)
replace_once(
    build,
    "for (const asset of ['penguin-guide.svg', 'penguin-guide-welcome.svg']) {",
    "for (const asset of ['penguin-guide.svg', 'penguin-guide-welcome.svg', 'elephant-create.svg', 'clay-remy-writing.svg']) {"
)
replace_once(
    build,
    "for (const reference of ['gradecrew-brand.css', 'crew-clay.css', 'styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-teacher-flow.js']) {",
    "for (const reference of ['gradecrew-brand.css', 'crew-clay.css', 'styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'escape-remy-voice.js', 'escape-teacher-flow.js']) {"
)
replace_once(
    build,
    "for (const name of ['gradecrew-brand.css', 'crew-clay.css', 'assets/gradecrew/penguin-guide.svg', 'assets/gradecrew/penguin-guide-welcome.svg']) {",
    "for (const name of ['gradecrew-brand.css', 'crew-clay.css', 'assets/gradecrew/penguin-guide.svg', 'assets/gradecrew/penguin-guide-welcome.svg', 'assets/gradecrew/elephant-create.svg', 'assets/gradecrew/clay-remy-writing.svg']) {"
)
replace_once(build, "  version: '0.5.0',", "  version: '0.6.0',")
replace_once(
    build,
    "    teacherAiRequiresHostBridge: true,\n    teacherAiGeneration: true,",
    "    teacherAiRequiresHostBridge: true,\n    standaloneRemyPreviewClickable: true,\n    remyCreationRole: true,\n    remyVoicePreview: true,\n    teacherAiGeneration: true,"
)
replace_once(build, "console.log('Escape Room MVP build verified: locked-school lab v0.5.0.');", "console.log('Escape Room MVP build verified: locked-school lab v0.6.0.');")

# Tests: creation role, shared Remy artwork, clickable standalone preview, voice surface.
test_path = 'tools/games/escape-coco-ai.test.cjs'
replace_once(
    test_path,
    "    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /8 Escape-Aufgaben/);\n    assert.equal(d.getElementById('teacherAiLogin'), null);",
    "    assert.match(d.getElementById('teacherAiGenerateBtn').textContent, /Remy/);\n    assert.match(d.querySelector('.teacherAiRemy img').getAttribute('src'), /clay-remy-writing\\.svg/);\n    assert.equal(d.querySelector('.teacherAiRemy img').getAttribute('alt'), 'Remy');\n    assert.match(d.querySelector('#teacherAiCard h3').textContent, /Remy/);\n    assert.ok(d.getElementById('teacherAiRemyMic'));\n    const remySvg = fs.readFileSync(path.join(root, 'assets', 'gradecrew', 'elephant-create.svg'), 'utf8');\n    assert.match(remySvg, /<view id=\"pose-1\"/);\n    assert.match(remySvg, /<view id=\"pose-6\"/);\n    assert.doesNotMatch(remySvg, /Reduzierte Editorial-Illustration/);\n    assert.equal(d.getElementById('teacherAiLogin'), null);"
)
replace_once(test_path, "test('Coco generator uses one 16-question GradeCrew request for eight main-transfer pairs'", "test('Remy generator uses one 16-question GradeCrew request for eight main-transfer pairs'")
replace_once(
    test_path,
    "    'escape-coco-ai.js',\n    'escape-teacher-flow.js'",
    "    'escape-coco-ai.js',\n    'escape-remy-voice.js',\n    'escape-teacher-flow.js'"
)
append = r'''

test('standalone lab keeps the Remy preparation action clickable without faking AI generation', () => {
  const { w, d } = openEscape();
  try {
    delete w.GradeCrewEscapeAiBridge;
    w.dispatchEvent(new w.Event('gradecrew:escape-ai-bridge-ready'));
    const button = d.getElementById('teacherAiGenerateBtn');
    assert.equal(button.disabled, false);
    assert.match(button.textContent, /Remy-Vorschau/);
    d.getElementById('teacherAiSubject').value = 'Deutsch';
    d.getElementById('teacherAiGrade').value = '5';
    d.getElementById('teacherAiTopic').value = 'Wortarten';
    button.click();
    assert.match(d.getElementById('teacherContentProfile').textContent, /Deutsch · Klasse 5 · Wortarten/);
    assert.match(d.getElementById('teacherAiStatus').textContent, /keine echte KI-Erstellung vortäuschen/);
  } finally {
    w.close();
  }
});

test('Remy voice control is present and fails locally when browser speech recognition is unavailable', () => {
  const { w, d } = openEscape();
  try {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
    d.getElementById('teacherAiRemyMic').click();
    assert.match(d.getElementById('teacherAiVoiceStatus').textContent, /Browser noch nicht unterstützt/);
    const voiceSource = fs.readFileSync(path.join(source, 'escape-remy-voice.js'), 'utf8');
    assert.match(voiceSource, /SpeechRecognition/);
    assert.doesNotMatch(voiceSource, /localStorage|sessionStorage|MediaRecorder/);
  } finally {
    w.close();
  }
});

test('Remy generator exposes a role-correct API while keeping the legacy alias compatible', () => {
  const { w } = openEscape();
  try {
    assert.ok(w.GradeCrewEscapeRemyGenerator);
    assert.equal(w.GradeCrewEscapeRemyGenerator, w.GradeCrewEscapeAiGenerator);
  } finally {
    w.close();
  }
});
'''
write(test_path, read(test_path).rstrip() + append + '\n')

# README gets a short durable v0.6 record; full run/commit IDs are added after CI/deploy.
readme = 'lab/escape-room/README.md'
write(readme, read(readme).rstrip() + r'''

## v0.6 – Remy erstellt, Coco begleitet

- Rollen korrigiert: **Remy** ist für das Erstellen der Escape-Lernaufgaben zuständig; **Coco** bleibt Explorer und Lernhilfe im Spiel.
- Die Erstellungskarte verwendet das freigegebene Shared-Remy-Artwork statt einer lokalen alten Elefantenkopie.
- Der Standalone-Lab-Button ist nicht mehr tot. Ohne geschützte GradeCrew-Bridge bereitet Remy die eingegebenen Eckdaten als ehrliche Lab-Vorschau vor; es werden dabei ausdrücklich keine neuen KI-Aufgaben vorgetäuscht.
- Mit `GradeCrewEscapeAiBridge.generateTest` bleibt derselbe Button für die echte 8+8-Erstellung vorbereitet.
- `🎙 Mit Remy sprechen` nutzt im Lab die bereits in GradeCrew erprobte Browser-Diktat-V1 als Progressive Enhancement und schreibt den gesprochenen Wunsch nur ins sichtbare Wunschfeld. Audio wird nicht gespeichert.
- Die spätere Produktintegration soll weiterhin den gemeinsamen Crew-Assistant-/Voice-Vertrag verwenden; kein zweites Voice-Backend im Escape.
'''.lstrip())

print('Escape v0.6 Remy/voice patch applied.')
