from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'lab' / 'escape-room' / 'app.js'
TEST = ROOT / 'tools' / 'games' / 'escape-room.test.cjs'


def replace_once(text, before, after, label):
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(before, after, 1)


def block(lines):
    return '\n'.join(lines)


app = APP.read_text()
app = replace_once(
    app,
    "    clueReviewRequired: {},\n    flags: {",
    "    clueReviewRequired: {},\n    clueReviewProgress: {},\n    flags: {",
    'add clue review progress state'
)

old_guard = block([
    "    if (attempts >= 2 && ['locker-sequence', 'key-sequence'].includes(activePuzzle)) {",
    "      S.clueReviewRequired[activePuzzle] = true;",
    "      feedback.textContent = 'Nicht weiter raten. Das Rätsel wird geschlossen – lies den ursprünglichen Hinweis noch einmal.';",
    "      const puzzleId = activePuzzle;",
    "      event('puzzle.guess_guard', { puzzleId, attempts });",
    "      save();",
    "      setTimeout(() => {",
    "        $('puzzleDialog').close();",
    "        msg(puzzleId === 'locker-sequence'",
    "          ? 'Schau noch einmal am Schwarzen Brett nach, bevor du den Spind erneut öffnest.'",
    "          : 'Lies die Symbolfolge am Computer noch einmal, bevor du das Schlüsselbrett erneut versuchst.');",
    "      }, 450);",
    "      return;",
    "    }"
])
new_guard = block([
    "    if (attempts >= 2 && ['board-pattern', 'door-code', 'locker-sequence', 'key-sequence'].includes(activePuzzle)) {",
    "      const puzzleId = activePuzzle;",
    "      S.clueReviewRequired[puzzleId] = true;",
    "      if (puzzleId === 'door-code') S.clueReviewProgress[puzzleId] = [];",
    "      feedback.textContent = 'Nicht weiter raten. Das Rätsel wird geschlossen – prüfe zuerst die Hinweise noch einmal.';",
    "      event('puzzle.guess_guard', { puzzleId, attempts });",
    "      save();",
    "      setTimeout(() => {",
    "        $('puzzleDialog').close();",
    "        const reviewMessages = {",
    "          'board-pattern': 'Schau dir die Tafel noch einmal bewusst an und achte darauf, wie sich die Zahlen verändern.',",
    "          'door-code': 'Prüfe die drei Codequellen noch einmal: Regal, Computer und Tafel.',",
    "          'locker-sequence': 'Schau noch einmal am Schwarzen Brett nach, bevor du den Spind erneut öffnest.',",
    "          'key-sequence': 'Lies die Symbolfolge am Computer noch einmal, bevor du das Schlüsselbrett erneut versuchst.'",
    "        };",
    "        msg(reviewMessages[puzzleId] || 'Prüfe zuerst die gefundenen Hinweise.');",
    "      }, 450);",
    "      return;",
    "    }"
])
app = replace_once(app, old_guard, new_guard, 'expand puzzle guess guard')

classroom_start = "  function classroom(action) {\n    if (action === 'desk') return openQuestion('q1', 'q1Battery');"
classroom_new = block([
    "  function classroom(action) {",
    "    if (S.clueReviewRequired['door-code'] && ['shelf', 'computer', 'board'].includes(action)) {",
    "      const values = { shelf: '4', computer: '7', board: '8' };",
    "      const labels = { shelf: 'Regal', computer: 'Computer', board: 'Tafel' };",
    "      S.clueReviewProgress ||= {};",
    "      const reviewed = new Set(S.clueReviewProgress['door-code'] || []);",
    "      reviewed.add(action);",
    "      S.clueReviewProgress['door-code'] = [...reviewed];",
    "      const missing = ['shelf', 'computer', 'board'].filter(source => !reviewed.has(source));",
    "      if (!missing.length) {",
    "        delete S.clueReviewRequired['door-code'];",
    "        delete S.clueReviewProgress['door-code'];",
    "        S.puzzleAttempts['door-code'] = 0;",
    "        save();",
    "        return msg(`Alle Codequellen geprüft: Regal ${values.shelf} · Computer ${values.computer} · Tafel ${values.board}. Jetzt darfst du den Code erneut eingeben.`);",
    "      }",
    "      save();",
    "      return msg(`${labels[action]} erneut geprüft: Codefragment ${values[action]}. Noch prüfen: ${missing.map(source => labels[source]).join(', ')}.`);",
    "    }",
    "",
    "    if (action === 'desk') return openQuestion('q1', 'q1Battery');"
])
app = replace_once(app, classroom_start, classroom_new, 'door code clue review')

board_old = block([
    "    if (action === 'board') return S.flags.code8",
    "      ? msg('Die Tafel zeigt: 2 – 4 – 6 – 8.')",
    "      : openPuzzle('board-pattern', 'Muster an der Tafel', '2 – 4 – 6 – ? Welche Zahl setzt das Muster fort?');"
])
board_new = block([
    "    if (action === 'board') {",
    "      if (S.clueReviewRequired['board-pattern']) {",
    "        delete S.clueReviewRequired['board-pattern'];",
    "        S.puzzleAttempts['board-pattern'] = 0;",
    "        save();",
    "        return msg('Tafel erneut gelesen: 2 – 4 – 6 – ?. Achte auf den gleichbleibenden Abstand zwischen den Zahlen. Tippe die Tafel erneut an, wenn du die Fortsetzung weißt.');",
    "      }",
    "      return S.flags.code8",
    "        ? msg('Die Tafel zeigt: 2 – 4 – 6 – 8.')",
    "        : openPuzzle('board-pattern', 'Muster an der Tafel', '2 – 4 – 6 – ? Welche Zahl setzt das Muster fort?');",
    "    }"
])
app = replace_once(app, board_old, board_new, 'board clue review')
APP.write_text(app)

test = TEST.read_text()
anchor = "test('full route reaches the exit; repeated symbol guessing forces clue review', () => {"
new_tests = block([
    "test('repeated board guessing forces the learner to reread the pattern before retrying', () => {",
    "  const { w, d } = openEscape();",
    "  try {",
    "    d.getElementById('startBtn').click();",
    "    click(d, '[data-action=\"board\"]');",
    "    clickPuzzleText(d, '7');",
    "    d.getElementById('puzzleResetBtn').click();",
    "    clickPuzzleText(d, '10');",
    "    assert.equal(d.getElementById('puzzleDialog').open, false);",
    "    click(d, '[data-action=\"board\"]');",
    "    assert.equal(d.getElementById('puzzleDialog').open, false);",
    "    assert.match(d.getElementById('messageBar').textContent, /gleichbleibenden Abstand/);",
    "    click(d, '[data-action=\"board\"]');",
    "    assert.equal(d.getElementById('puzzleDialog').open, true);",
    "  } finally { w.close(); }",
    "});",
    "",
    "test('two wrong door codes require reviewing all three code sources before another attempt', () => {",
    "  const { w, d } = openEscape();",
    "  try {",
    "    const set = w.GradeCrewEscapeIntegration.getQuestionSet();",
    "    d.getElementById('startBtn').click();",
    "    click(d, '[data-action=\"desk\"]'); submitAnswer(w, d, set[0].correctIndex);",
    "    click(d, '[data-action=\"cabinet\"]'); click(d, '.inventoryItem'); click(d, '[data-action=\"cabinet\"]');",
    "    click(d, '[data-action=\"shelf\"]'); submitAnswer(w, d, set[1].correctIndex);",
    "    click(d, '[data-action=\"computer\"]'); submitAnswer(w, d, set[2].correctIndex);",
    "    click(d, '[data-action=\"board\"]'); clickPuzzleText(d, '8');",
    "    click(d, '[data-action=\"door\"]'); clickPuzzleText(d, '1'); clickPuzzleText(d, '1'); clickPuzzleText(d, '1');",
    "    d.getElementById('puzzleResetBtn').click();",
    "    clickPuzzleText(d, '2'); clickPuzzleText(d, '2'); clickPuzzleText(d, '2');",
    "    assert.equal(d.getElementById('puzzleDialog').open, false);",
    "    click(d, '[data-action=\"door\"]');",
    "    assert.equal(d.getElementById('puzzleDialog').open, false);",
    "    click(d, '[data-action=\"shelf\"]');",
    "    click(d, '[data-action=\"computer\"]');",
    "    click(d, '[data-action=\"door\"]');",
    "    assert.equal(d.getElementById('puzzleDialog').open, false);",
    "    click(d, '[data-action=\"board\"]');",
    "    assert.match(d.getElementById('messageBar').textContent, /Jetzt darfst du den Code erneut eingeben/);",
    "    click(d, '[data-action=\"door\"]');",
    "    assert.equal(d.getElementById('puzzleDialog').open, true);",
    "  } finally { w.close(); }",
    "});",
    "",
    anchor
])
test = replace_once(test, anchor, new_tests, 'anti guess tests')
TEST.write_text(test)

print('Escape anti-guess guards patched')
