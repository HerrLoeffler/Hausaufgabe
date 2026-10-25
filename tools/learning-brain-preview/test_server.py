"""Two loopback previews must not overwrite each other's browser login cookie."""
import importlib.util
import json
from pathlib import Path
import threading
from types import SimpleNamespace
import unittest
import urllib.request
from http.cookiejar import CookieJar
from http.server import ThreadingHTTPServer


class PreviewIsolation(unittest.TestCase):
    def test_two_profiles_share_a_browser_but_keep_separate_cookies(self):
        servers = []
        try:
            for name in ['a', 'b']:
                spec = importlib.util.spec_from_file_location('preview_' + name, Path(__file__).with_name('server.py'))
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                module.STATE.update(uid=name)
                module.token = lambda: 'synthetic-token'
                module.request_json = lambda *args, owner=name, **kwargs: {'result': {'owner': owner}}
                server = ThreadingHTTPServer(('127.0.0.1', 0), module.Handler)
                module.ARGS = SimpleNamespace(port=server.server_address[1], root=Path(__file__).parent)
                threading.Thread(target=server.serve_forever, daemon=True).start()
                servers.append(server)
            browser = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))
            def post(server, path, payload):
                origin = 'http://127.0.0.1:' + str(server.server_address[1])
                request = urllib.request.Request(origin + path, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', 'Origin': origin})
                with browser.open(request, timeout=5) as response:
                    return json.load(response)
            for server in servers:
                self.assertTrue(post(server, '/api/session', {})['authenticated'])
            for server, owner in zip(servers, ['a', 'b']):
                result = post(server, '/api/learning', {'method': 'learningBrainProfile', 'data': {}})
                self.assertEqual(result['data']['owner'], owner)
        finally:
            for server in servers:
                server.shutdown()
                server.server_close()


if __name__ == '__main__':
    unittest.main()
