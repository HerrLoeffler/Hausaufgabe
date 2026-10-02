from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'lab' / 'escape-room' / 'escape-coco-ai.js'
text = path.read_text(encoding='utf-8')
text = text.replace("  function setStatus(text, kind = '') {  function setStatus(text, kind = '') {", "  function setStatus(text, kind = '') {")
text = text.replace("  async function generate() {  async function generate() {", "  async function generate() {")
path.write_text(text, encoding='utf-8')
print('Escape v0.5 syntax repair applied.')
