import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from billing_sandbox_preview import build_preview, sanitize_workspace, CSP

class BillingPreviewTests(unittest.TestCase):
    def test_removes_runtime_inline_handlers_and_active_forms(self):
        source='<html><head><script src="app.js"></script></head><body><section id="dashboardView" class="view hidden"><button id="newQuizBtn" onclick="fetch(1)">Neu</button><input name="email"><form action="https://gradecrew.de"></form></section><section id="adminView">private template</section></body></html>'
        out=sanitize_workspace(source)
        self.assertNotIn('app.js',out)
        self.assertNotIn('onclick',out)
        self.assertNotIn('https://gradecrew.de',out)
        self.assertNotIn('private template',out)
        self.assertIn('disabled',out)
        self.assertIn('billing-preview.mjs',out)
        self.assertIn('connect-src \'none\'',CSP)
        self.assertIn('form-action \'none\'',CSP)
        self.assertIn('worker-src \'none\'',CSP)

    def test_wrong_project_rejected_without_output(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)
            with self.assertRaises(ValueError):
                build_preview(p,p/'missing.json',p/'out','hausaufgabe-staging')
            self.assertFalse((p/'out').exists())

    def test_tampered_source_rejected_without_output(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d); (p/'workspace.html').write_text('tampered')
            baseline=p/'baseline.json';baseline.write_text(json.dumps({'live_file_hashes':{'workspace.html':'0'*64}}))
            with self.assertRaises(ValueError): build_preview(p,baseline,p/'out','gradecrew-staging-2026')
            self.assertFalse((p/'out').exists())

    def test_build_has_no_firebase_config_or_original_js(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d); html='<html><head><script src="firebase-config.js"></script></head><body><section id="dashboardView" class="view hidden"></section><section id="settingsView" class="view hidden"></section></body></html>'
            (p/'workspace.html').write_text(html)
            b=p/'baseline.json';b.write_text(json.dumps({'live_file_hashes':{'workspace.html':hashlib.sha256(html.encode()).hexdigest()}}))
            result=build_preview(p,b,p/'out','gradecrew-staging-2026')
            self.assertEqual(result['mode'],'ui_preview_only')
            self.assertFalse(result['checkoutEnabled'])
            self.assertEqual(result['files']['index.html'],result['files']['workspace.html'])
            self.assertFalse((p/'out/firebase-config.js').exists())
            self.assertFalse((p/'out/app.js').exists())
            config=json.loads((p/'out/../hosting-config.json').read_text())
            headers=config['headers'][0]['headers']
            self.assertIn(CSP,[h['value'] for h in headers if h['key']=='Content-Security-Policy'])

if __name__=='__main__': unittest.main()
