from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = ROOT / 'lab/escape-room/app.js'
text = p.read_text(encoding='utf-8')
old = "    $('teacherQuestions').replaceChildren(...questionBank.map(teacherCard));\n  }\n"
new = "    $('teacherQuestions').replaceChildren(...questionBank.map(teacherCard));\n    window.dispatchEvent(new CustomEvent('gradecrew:escape-teacher-rendered'));\n  }\n"
if text.count(old) != 1:
    raise SystemExit(f'app.js: expected renderTeacher anchor once, found {text.count(old)}')
p.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Synchronous teacher refresh hook applied.')
