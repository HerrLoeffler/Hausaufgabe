"""Build separate Firebase preview assets and a Gen2 Function source package."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from billing_sandbox_preview import CSP, PROJECT

CHANNEL = 'billing-plan-01'
SERVICE = 'gradecrew-billing-sandbox'
REGION = 'europe-west1'
HERE = Path(__file__).parent


def build(preview, output, project, channel):
    if (project, channel) != (PROJECT, CHANNEL):
        raise ValueError('Only the named sandbox preview is supported')
    receipt = HERE.parent / 'docs/billing/sandbox-v1/preview-deploy-2026-11-08.json'
    hashes = json.loads(receipt.read_text())['files']
    assets = {}
    for path, digest in hashes.items():
        name = path.lstrip('/')
        data = (preview / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != digest:
            raise ValueError('Mismatched preview asset: ' + name)
        if name in ('index.html', 'workspace.html'):
            data = data.replace(b'</body>', b'<script type="module" src="/billing-hosted.mjs"></script></body>')
        if name != 'release.json':
            assets[name] = data

    hosted = HERE / 'billing-sandbox-hosted'
    assets['billing-hosted.mjs'] = (hosted / 'billing-hosted.mjs').read_bytes()
    assets['billing-preview.css'] += (
        b'\n.billingPreviewCard [hidden] {display:none}\n'
        b'#billingLogin:not([hidden]) {display:grid; gap:12px; max-width:360px}\n'
        b'#billingLogin label {display:grid; gap:4px}\n'
    )
    output.mkdir(parents=True)
    for name, data in assets.items():
        dest = output / 'public' / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    config = {'hosting': {'site': PROJECT, 'public': 'public', 'rewrites': [
        {'source': '/billing-test/api/**', 'run': {'serviceId': SERVICE, 'region': REGION}},
    ], 'headers': [{'source': '**', 'headers': [
        {'key': 'Content-Security-Policy', 'value': CSP.replace("connect-src 'none'", "connect-src 'self'")},
        {'key': 'Cache-Control', 'value': 'private, no-store'},
        {'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'},
        {'key': 'X-Content-Type-Options', 'value': 'nosniff'},
        {'key': 'Referrer-Policy', 'value': 'no-referrer'},
    ]}]}}
    (output / 'firebase.json').write_text(json.dumps(config, indent=2) + '\n')
    with ZipFile(output / 'function.zip', 'x', ZIP_DEFLATED) as archive:
        for source in (hosted/'main.py', hosted/'requirements.txt',
                       HERE/'billing_sandbox_access.py', HERE/'billing_sandbox_preview.py'):
            archive.write(source, source.name)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--project', required=True)
    parser.add_argument('--channel', required=True)
    args = parser.parse_args()
    build(args.preview, args.output, args.project, args.channel)
