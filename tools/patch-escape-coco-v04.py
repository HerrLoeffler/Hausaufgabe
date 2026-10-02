from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if new in text:
        return
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected exactly one anchor, found {count}: {old[:80]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


def replace_all(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        return
    p.write_text(text.replace(old, new), encoding='utf-8')


# Visible Coco identity. Internal remy* ids/functions stay stable to avoid needless
# overlap with the parallel tutor-cost-guard branch; user-facing copy is Coco only.
replace_once(
    'lab/escape-room/index.html',
    '<div id="explorer" class="explorer" aria-hidden="true">🐧</div>',
    '<div id="explorer" class="explorer" aria-hidden="true"><img class="cocoExplorerArt" src="assets/gradecrew/penguin-guide.svg" alt=""></div>'
)
replace_once(
    'lab/escape-room/index.html',
    '<div class="remyAvatar" aria-hidden="true">🐧</div>',
    '<div class="remyAvatar" aria-hidden="true"><img class="cocoHelpArt" src="assets/gradecrew/penguin-guide.svg" alt=""></div>'
)
replace_all('lab/escape-room/index.html', 'Frag Remy', 'Frag Coco')
replace_all('lab/escape-room/index.html', '>Remy fragen<', '>Coco fragen<')
replace_once(
    'lab/escape-room/index.html',
    'Bekannte Fragen werden lokal beantwortet. Eine externe KI wird nur über eine spätere GradeCrew-Brücke genutzt.',
    'Coco beantwortet bekannte Fragen lokal. Nur wirklich individuelle Fragen können später über die GradeCrew-KI laufen.'
)
replace_once(
    'lab/escape-room/index.html',
    'Die 8 Lernslots können vor dem Start geprüft und direkt bearbeitet werden. Später kann der GradeCrew-Generator dieselben Slots automatisch befüllen.',
    'Die 8 Lernslots können geprüft, direkt bearbeitet oder unten mit der GradeCrew-KI neu erstellt werden.'
)
replace_once(
    'lab/escape-room/index.html',
    '  <script src="escape-teacher-compact.js"></script>\n',
    '  <script src="escape-teacher-compact.js"></script>\n  <script src="escape-coco-ai.js"></script>\n'
)

replace_all('lab/escape-room/app.js', 'frag Remy ganz konkret', 'frag Coco ganz konkret')
replace_all('lab/escape-room/app.js', 'Remy denkt kurz nach …', 'Coco denkt kurz nach …')

# Build: include the new controller, the staging Firebase public config and canonical
# Coco assets already present in the GradeCrew asset tree.
replace_once(
    'tools/build-lab-escape-room.mjs',
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'README.md'];",
    "const files = ['index.html', 'styles.css', 'escape-v2.css', 'escape-data.js', 'escape-tutor.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js', 'README.md'];"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const name of files) await fs.copyFile(path.join(source, name), path.join(output, name));\n",
    "for (const name of files) await fs.copyFile(path.join(source, name), path.join(output, name));\n\nawait fs.copyFile(path.join(root, 'firebase-config.staging.js'), path.join(output, 'firebase-config.js'));\nawait fs.mkdir(path.join(output, 'assets', 'gradecrew'), { recursive: true });\nfor (const asset of ['penguin-guide.svg', 'penguin-guide-welcome.svg']) {\n  await fs.copyFile(path.join(root, 'assets', 'gradecrew', asset), path.join(output, 'assets', 'gradecrew', asset));\n}\n"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js']) {",
    "for (const reference of ['styles.css', 'escape-v2.css', 'escape-data.js', 'gradecrew-question-adapter.js', 'gradecrew-escape-builder.js', 'escape-tutor.js', 'app.js', 'escape-teacher-compact.js', 'escape-coco-ai.js']) {"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "for (const marker of ['Die verriegelte Schule', 'Lehrer-Vorschau', 'data-open-mode=\"practice\"', 'gameView', 'Frag Remy']) {",
    "for (const marker of ['Die verriegelte Schule', 'Lehrer-Vorschau', 'data-open-mode=\"practice\"', 'gameView', 'Frag Coco', 'escape-coco-ai.js', 'penguin-guide.svg']) {"
)
replace_once(
    'tools/build-lab-escape-room.mjs',
    "const hashes = {};\nfor (const name of files) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');",
    "const hashes = {};\nfor (const name of files) hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');\nfor (const name of ['firebase-config.js', 'assets/gradecrew/penguin-guide.svg', 'assets/gradecrew/penguin-guide-welcome.svg']) {\n  hashes[name] = createHash('sha256').update(await fs.readFile(path.join(output, name))).digest('hex');\n}"
)
replace_all('tools/build-lab-escape-room.mjs', "version: '0.3.0'", "version: '0.4.0'")
replace_once(
    'tools/build-lab-escape-room.mjs',
    '    teacherQuestionEditing: true,\n',
    '    teacherQuestionEditing: true,\n    cocoCanonicalArtwork: true,\n    teacherAiGeneration: true,\n    teacherAiUsesExistingGenerateTest: true,\n    teacherAiPairedTransfers: true,\n'
)
replace_all('tools/build-lab-escape-room.mjs', 'locked-school lab v0.3.0', 'locked-school lab v0.4.0')

# Include focused tests in both npm test and the Escape-only deploy gate.
replace_once(
    'tools/games/package.json',
    'regression.test.cjs escape-room.test.cjs escape-tutor.test.cjs gradecrew-escape-adapter.test.cjs gradecrew-escape-builder.test.cjs',
    'regression.test.cjs escape-room.test.cjs escape-tutor.test.cjs escape-coco-ai.test.cjs gradecrew-escape-adapter.test.cjs gradecrew-escape-builder.test.cjs'
)
replace_once(
    '.github/workflows/escape-dev-preview.yml',
    "      - 'tools/games/escape-tutor.test.cjs'\n",
    "      - 'tools/games/escape-tutor.test.cjs'\n      - 'tools/games/escape-coco-ai.test.cjs'\n"
)
replace_once(
    '.github/workflows/escape-dev-preview.yml',
    '      - name: Run Escape Room, Remy and GradeCrew preparation tests\n        run: node --test tools/games/escape-room.test.cjs tools/games/escape-tutor.test.cjs tools/games/gradecrew-escape-adapter.test.cjs tools/games/gradecrew-escape-builder.test.cjs\n',
    '      - name: Run Escape Room, Coco and GradeCrew preparation tests\n        run: node --test tools/games/escape-room.test.cjs tools/games/escape-tutor.test.cjs tools/games/escape-coco-ai.test.cjs tools/games/gradecrew-escape-adapter.test.cjs tools/games/gradecrew-escape-builder.test.cjs\n'
)

# Docs: Coco is the sole visible Escape guide; generator reuses existing authenticated
# staging AI instead of introducing a second model/backend.
replace_all('lab/escape-room/README.md', 'Remy', 'Coco')
replace_once(
    'lab/escape-room/README.md',
    '# GradeCrew Escape Room – Lern-MVP v0.3',
    '# GradeCrew Escape Room – Lern-MVP v0.4'
)
readme = ROOT / 'lab/escape-room/README.md'
text = readme.read_text(encoding='utf-8')
marker = '## Kompakte Lehrerprüfung wie in GradeCrew\n'
section = '''## Coco + einfache KI-Aufgabenerstellung v0.4\n\nEscape verwendet sichtbar nur noch **Coco** und die vorhandenen GradeCrew-Coco-Assets (`penguin-guide.svg` / `penguin-guide-welcome.svg`) statt Emoji-Platzhaltern oder eines zweiten Maskottchennamens. Interne Legacy-IDs wie `remyHelp` bleiben vorerst nur aus Kompatibilitätsgründen bestehen.\n\nDie Lehrer-Vorschau hat zusätzlich einen kompakten KI-Generator:\n\n- Fach\n- Klasse\n- Thema\n- Schwierigkeit\n- optional ein eigener Wunsch\n- Aktion **„8 Escape-Aufgaben erstellen“**\n\nEs wird **kein zweites KI-Backend** gebaut. Der Lab-Preview nutzt den vorhandenen authentifizierten GradeCrew-Callable `generateTest` in `europe-west1`. Für den eigenständigen Preview meldet sich die Lehrkraft einmal mit dem GradeCrew-Lehrerkonto an; in der späteren Haupt-App kann dieselbe UI über `GradeCrewEscapeAiBridge` die bestehende Sitzung nutzen.\n\nEin KI-Lauf erzeugt 16 bildfreie, automatisch prüfbare Aufgaben: die ersten 8 Hauptaufgaben und die Aufgaben 9–16 als passende Transferpaare. Nur die 8 Hauptaufgaben erscheinen als Lernslots. Die Transferaufgaben werden in die bestehende Lernschleife eingebaut. Spiellogik und Anti-Raten-Regeln werden niemals von der KI erzeugt.\n\nDer erzeugte Fragensatz wird lokal für den Preview gespeichert, damit ein Reload bzw. Save/Resume nicht auf die Prozentrechnungs-Beispielfragen zurückfällt.\n\n'''
if '## Coco + einfache KI-Aufgabenerstellung v0.4' not in text:
    if marker not in text:
        raise SystemExit('README insertion marker missing')
    text = text.replace(marker, section + marker, 1)
readme.write_text(text, encoding='utf-8')

handoff = ROOT / 'workstreams/escape-room-mvp.md'
htext = handoff.read_text(encoding='utf-8')
hsection = '''\n## v0.4 – Coco + kompakte KI-Aufgabenerstellung\n\n- Sichtbare Escape-Begleitung ist **Coco**; Emoji-Platzhalter und sichtbare „Remy“-Texte wurden entfernt.\n- Canonical Escape-Art: `assets/gradecrew/penguin-guide.svg` und `penguin-guide-welcome.svg`.\n- Neue Lehrer-Karte: Fach, Klasse, Thema, Schwierigkeit, optionaler Wunsch → **8 Escape-Aufgaben erstellen**.\n- Wiederverwendung des bestehenden authentifizierten GradeCrew-Callables `generateTest`; kein zweites KI-Backend und kein clientseitiger API-Key.\n- Ein KI-Lauf erzeugt 8 Hauptaufgaben + 8 passende Transferaufgaben; der Escape-Adapter/Preflight bleibt das Gate.\n- Generator beschränkt sich auf sicher automatisch prüfbare, bildfreie Typen.\n- Eigenständiger Preview: einmalige GradeCrew-E-Mail/Passwort-Anmeldung über Firebase Auth. In der späteren Haupt-App ist `GradeCrewEscapeAiBridge` als Sitzungs-/Generator-Brücke vorgesehen.\n- Generierter Satz wird im Preview lokal gespeichert und bei Reload wiederhergestellt; manuelle Änderungen werden mitgesichert.\n- Production bleibt unberührt.\n\n**Prüfstatus dieses Abschnitts:** Codeänderungen werden durch den v0.4-Patch-Workflow getestet und erst danach committed. Escape-only Staging-Deploy erfolgt anschließend durch den bestehenden Preview-Workflow; Geräteabnahme bleibt separat.\n'''
if '## v0.4 – Coco + kompakte KI-Aufgabenerstellung' not in htext:
    htext += hsection
handoff.write_text(htext, encoding='utf-8')

print('Escape Coco + AI v0.4 patch applied.')
