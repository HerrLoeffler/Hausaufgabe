"""A partial run, missing screenshot or measured defect must never become green."""
import importlib.util
import json
from pathlib import Path
import tempfile

path = Path(__file__).parent / 'LayoutTests/run_layout_checks.py'
spec = importlib.util.spec_from_file_location('layout_runner', path)
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
policy = {'expectedReportsPerFamily': {'native': 1, 'web': 1}}
with tempfile.TemporaryDirectory() as work:
    folder = Path(work)
    assert len(runner.summarize(folder, policy)['issues']) == 2
    for name in ['native-login-small', 'web-editor-small']:
        (folder / (name + '.json')).write_text(json.dumps({'issues': []}))
        (folder / (name + '.png')).write_bytes(b'fixture-only-presence-check')
    assert runner.summarize(folder, policy)['issues'] == []
    (folder / 'web-editor-small.json').write_text(json.dumps({'issues': [{'rule': 'horizontal-overflow'}]}))
    assert runner.summarize(folder, policy)['issues'][0]['issue']['rule'] == 'horizontal-overflow'
    (folder / 'web-editor-small.png').unlink()
    assert any('screenshot missing' in str(i) for i in runner.summarize(folder, policy)['issues'])
    (folder / 'web-editor-small.json').write_text('{}')
    assert any('missing issues field' in str(i) for i in runner.summarize(folder, policy)['issues'])
print('Layout runner: incomplete runs, missing screenshots and actual defects fail closed.')

spec = importlib.util.spec_from_file_location('layout_source', path.parent/'verify_integration_source.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
pin = {'files': {'index.html': {'sha256': 'expected'}}}
source.compare_manifest({'files': {'index.html':'expected'}}, pin)
for manifest in [{}, {'files': {'index.html':'stale'}}]:
    try:
        source.compare_manifest(manifest,pin)
        raise AssertionError('Source drift must fail')
    except ValueError:
        pass
assert source.allowed('https://hausaufgabe-staging--preview.web.app/release.json')
for url in ['https://gradecrew.app/', 'http://hausaufgabe-staging.web.app/', 'https://hausaufgabe-staging.web.app.evil.invalid/', 'https://user:secret@hausaufgabe-staging.web.app/']:
    assert not source.allowed(url)
print('Layout source guard: changed/missing source hashes fail; reads only staging.')
