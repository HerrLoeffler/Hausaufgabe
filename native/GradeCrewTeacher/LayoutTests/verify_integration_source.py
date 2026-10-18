"""Read-only CI guard: pinned layout fixtures must match the app's actual staging UI."""
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = Path(__file__).resolve().parent

def allowed(url):
    u = urllib.parse.urlsplit(url)
    host = u.hostname or ''
    return u.scheme == 'https' and not u.username and not u.password and u.port in (None,443) and (host in ('hausaufgabe-staging.web.app', 'gradecrew-staging-2026.web.app') or (host.startswith('hausaufgabe-staging--') and host.endswith('.web.app')))

def compare_manifest(manifest, pin):
    mismatches = [path for path, info in pin['files'].items() if manifest.get('files',{}).get(path) != info['sha256']]
    if mismatches:
        raise ValueError('Integration source changed; refresh and review offline fixtures before release: ' + ', '.join(mismatches))

def main():
    pin = json.loads((HERE/'Web/Source/provenance.json').read_text())
    base = pin['integrationURL'].rstrip('/')
    if not allowed(base):
        raise ValueError('Only GradeCrew staging origins may be read')
    def read(path):
        url = base + '/' + urllib.parse.quote(path, safe='/')
        with urllib.request.urlopen(urllib.request.Request(url, headers={'Cache-Control':'no-cache'}), timeout=30) as response:
            if not allowed(response.url):
                raise ValueError('Unexpected source redirect')
            data = response.read(8 * 1024 * 1024 + 1)
            if len(data) > 8 * 1024 * 1024:
                raise ValueError('Unexpectedly large source file')
            return data
    manifest = json.loads(read('release.json'))
    compare_manifest(manifest,pin)
    def check(item):
        path,info = item
        if hashlib.sha256(read(path)).hexdigest() != info['sha256']:
            raise ValueError('Served bytes differ from layout pin: ' + path)
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(check, pin['files'].items()))
    print(f'Current integration source verified: {manifest.get("version")}, {len(pin["files"])} served files. No deployment or account access.')

if __name__ == '__main__':
    main()
