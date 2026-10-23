"""Local preview serving the existing app and canonical brand sources only."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / 'docs/prototypes/firmenzentrale'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = unquote(urlsplit(path).path)
        if path.startswith('/assets/gradecrew/') or path.startswith('/shared/gradecrew-design/'):
            candidate = ROOT / path.lstrip('/')
            allowed = ROOT / ('assets/gradecrew' if path.startswith('/assets/') else 'shared/gradecrew-design')
        else:
            candidate = APP / (path.lstrip('/') or 'index.html')
            allowed = APP
        resolved = candidate.resolve()
        if not resolved.is_relative_to(allowed.resolve()) or not resolved.is_file():
            return str(APP / '__not_found__')
        return str(resolved)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8796)
    args = parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
