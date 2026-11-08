"""Build an inert preview from hash-verified GradeCrew workspace assets.

No Firebase configuration, authentication, provider adapter or product runtime is
included. Deployment is separate; this tool never reads credentials or uses HTTP.
"""
import argparse
import hashlib
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, unquote

PROJECT = 'gradecrew-staging-2026'
CSP = "; ".join([
    "default-src 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:", "font-src 'self' data:", "connect-src 'none'",
    "form-action 'none'", "frame-src 'none'", "frame-ancestors 'none'",
    "worker-src 'none'", "object-src 'none'", "base-uri 'none'",
])
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
ALLOWED_BUTTONS = {'brandBtn','settingsTopBtn','backFromSettings'}


class Workspace(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts = []
        self.skip = 0

    def handle_decl(self, value):
        if not self.skip:
            self.parts.append('<!' + value + '>')

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if self.skip:
            if tag not in VOID:
                self.skip += 1
            return
        blocked = tag in {'script','iframe','object','embed','base','audio','video'}
        is_view = 'view' in d.get('class','').split() or d.get('id','').endswith('View')
        blocked |= tag == 'section' and is_view and d.get('id') not in {'dashboardView','settingsView'}
        blocked |= tag == 'link' and d.get('rel') not in {'stylesheet','icon'}
        blocked |= tag == 'meta' and 'http-equiv' in d
        if blocked:
            if tag not in VOID:
                self.skip = 1
            return
        clean = {}
        for key,value in attrs:
            if key.startswith('on') or key in {'action','formaction','srcset','integrity','crossorigin'}:
                continue
            if key in {'src','href'} and value and not value.startswith('#'):
                u = urlsplit(value)
                if u.scheme or u.netloc or '..' in Path(unquote(u.path)).parts:
                    continue
            clean[key] = value
        if tag == 'a' and not clean.get('href','').startswith('#'):
            clean['href'] = '#'
            clean['aria-disabled'] = 'true'
            clean['tabindex'] = '-1'
        if tag in {'input','textarea','select','button'} and d.get('id') not in ALLOWED_BUTTONS:
            clean['disabled'] = None
        if d.get('id') in {'dashboardView','userBar'}:
            clean['class'] = ' '.join(x for x in d.get('class','').split() if x != 'hidden')
        values = ''.join(' '+k+(('="'+escape(v,quote=True)+'"') if v is not None else '') for k,v in clean.items())
        self.parts.append('<'+tag+values+'>')
        if tag == 'body':
            self.parts.append('<aside class="billingPreviewBanner" role="status"><strong>Testumgebung · Layoutvorschau</strong><span>Ohne Anmeldung, gespeicherte Konten oder Zahlungsanbindung. Keine echten Zahlungen.</span></aside>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.skip:
            if tag not in VOID:
                self.skip -= 1
            return
        if tag == 'head':
            self.parts.append('<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="billing-preview.css">')
        if tag == 'body':
            self.parts.append('<script type="module" src="billing-preview.mjs"></script>')
        if tag not in VOID:
            self.parts.append('</'+tag+'>')

    def handle_data(self, value):
        if not self.skip:
            self.parts.append(value)

    def handle_entityref(self, value):
        if not self.skip:
            self.parts.append('&'+value+';')

    def handle_charref(self, value):
        if not self.skip:
            self.parts.append('&#'+value+';')


def sanitize_workspace(source):
    parser = Workspace()
    parser.feed(source)
    parser.close()
    return ''.join(parser.parts)


def build_preview(source_dir, baseline_path, output_dir, project_id):
    if project_id != PROJECT:
        raise ValueError('Only the explicitly authorized test project is allowed')
    source_dir, output_dir = Path(source_dir), Path(output_dir)
    if output_dir.exists():
        raise ValueError('Use a new output directory; existing files are never overwritten')
    hashes = json.loads(Path(baseline_path).read_text())['live_file_hashes']

    def verified(path):
        data = (source_dir/path).read_bytes()
        if hashlib.sha256(data).hexdigest() != hashes.get(path):
            raise ValueError('Unverified source asset: '+path)
        return data

    html = sanitize_workspace(verified('workspace.html').decode())
    payload = {'index.html':html.encode(), 'workspace.html':html.encode()}
    support = Path(__file__).parent/'billing-sandbox-preview'
    for name in ['billing-preview.css','billing-preview.mjs']:
        payload[name] = (support/name).read_bytes()
    pending = re.findall(r'(?:src|href)="([^"#]+)"',html)
    allowed = {'.css','.svg','.png','.jpg','.jpeg','.webp','.woff','.woff2','.ttf','.ico'}
    while pending:
        value = pending.pop()
        u = urlsplit(value)
        if u.scheme or u.netloc:
            continue
        path = unquote(u.path).lstrip('/')
        if path in payload or not path:
            continue
        if '..' in Path(path).parts or Path(path).suffix.lower() not in allowed:
            raise ValueError('Nonstatic dependency: '+path)
        data = verified(path)
        payload[path] = data
        if path.endswith('.css'):
            for item in re.findall(r'url\(\s*[\'"]?([^\)\'"\s]+)',data.decode()):
                item_url = urlsplit(item)
                if item_url.scheme or item_url.netloc or item.startswith('#'):
                    continue
                child = (Path(path).parent/item_url.path).as_posix()
                pending.append(child)
    output_dir.mkdir(parents=True)
    for path,data in payload.items():
        dest = output_dir/path
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(data)
    manifest = {'task':'GC-BILLING-PLAN-01','project':PROJECT,'mode':'ui_preview_only',
                'checkoutEnabled':False,'authenticationEnabled':False,'databaseAccessEnabled':False,
                'sourceCommit':'80c845796fcb1efc324b1a266944a13bb06d7334',
                'files':{p:hashlib.sha256(d).hexdigest() for p,d in sorted(payload.items())}}
    (output_dir/'release.json').write_text(json.dumps(manifest,indent=2)+'\n')
    config = {'headers':[{'glob':'**','headers':[
        {'key':'Content-Security-Policy','value':CSP},
        {'key':'X-Content-Type-Options','value':'nosniff'},
        {'key':'Referrer-Policy','value':'no-referrer'},
        {'key':'X-Robots-Tag','value':'noindex, nofollow'},
        {'key':'Cache-Control','value':'no-store'},
    ]}]}
    (output_dir.parent/'hosting-config.json').write_text(json.dumps(config,indent=2)+'\n')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True,type=Path)
    parser.add_argument('--baseline',required=True,type=Path)
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--project',required=True)
    args = parser.parse_args()
    result = build_preview(args.source,args.baseline,args.output,args.project)
    print(json.dumps({'project':result['project'],'mode':result['mode'],'files':len(result['files'])}))
