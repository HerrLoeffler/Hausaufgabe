"""Local company workspace with a bounded Codex chat broker. Never a deploy tool."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse, fcntl, json, secrets
from central_runtime.service import Service
from central_desktop import identity
ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'docs/prototypes/firmenzentrale'

class Handler(SimpleHTTPRequestHandler):
 protocol_version='HTTP/1.1'
 def allowed(self, write=False):
  expected=f'127.0.0.1:{self.server.server_port}'
  if self.headers.get('Host')!=expected:return False
  origin=self.headers.get('Origin')
  if origin is not None and origin!='http://'+expected:return False
  if self.headers.get('Sec-Fetch-Site')=='cross-site':return False
  if write and (origin!='http://'+expected or not secrets.compare_digest(self.headers.get('X-Central-Token',''),self.server.token)):return False
  return True
 def json(self,data,status=200):
  body=json.dumps(data,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def do_GET(self):
  if not self.allowed():return self.json({'error':'Zugriff nur aus der lokalen Firmenzentrale'},403)
  path=urlsplit(self.path).path
  if path=='/api/desktop-health':return self.json(identity(self.server.service.store.root))
  if path=='/api/session':return self.json({'token':self.server.token})
  if path.startswith('/api/work-items/'):
   try:return self.json(self.server.service.operations.detail(path.rsplit('/',1)[-1]))
   except ValueError:return self.json({'error':'Auftrag nicht gefunden'},404)
  if path=='/api/state':return self.json(self.server.service.state())
  if path.startswith('/api/'):return self.json({'error':'Nicht gefunden'},404)
  return super().do_GET()
 def do_POST(self):
  if not self.allowed(True):return self.json({'error':'Lokale Sitzung ungültig. Seite neu laden.'},403)
  try:
   size=int(self.headers.get('Content-Length','0'))
   if size<=0 or size>65536:raise ValueError('Anfrage fehlt oder ist zu groß')
   if self.headers.get_content_type()!='application/json':raise ValueError('JSON erwartet')
   data=json.loads(self.rfile.read(size));path=urlsplit(self.path).path;service=self.server.service
   if not isinstance(data,dict):raise ValueError('Objekt erwartet')
   if path=='/api/work-items':return self.json(service.operations.create(data),201)
   if path=='/api/work-items/change':return self.json(service.operations.change(data))
   if path=='/api/work-items/decision':return self.json(service.operations.decide(data))
   if path=='/api/work-items/progress':return self.json(service.operations.progress(data))
   if path=='/api/work-items/prepare':return self.json(service.operations.prepare_handoff(data))
   if path=='/api/work-items/dispatch':return self.json(service.operations.dispatch(data),202)
   if path=='/api/work-items/refresh':return self.json({'started':service.operations.refresh(force=bool(data.get('force')))},202)
   if path=='/api/desktop-host/reconnect':
    if service.desktop_host:service.desktop_host.connect()
    return self.json({'started':bool(service.desktop_host)},202)
   if path=='/api/tasks':
    r=service.submit(data);return self.json({k:v for k,v in r.items() if k!='context'},202)
   if path=='/api/release-review':return self.json(service.releases.review(data),201)
   if path=='/api/releases/refresh':return self.json({'started':service.releases.refresh()},202)
   if path=='/api/refresh':return self.json({'started':service.sources.refresh()},202)
   if path=='/api/answer':service.answer(data.get('id'),data.get('answer'),data.get('callId'));return self.json({'ok':True})
   if path=='/api/cancel':service.cancel(data.get('id'));return self.json({'ok':True})
   if path=='/api/reconcile':service.reconcile();return self.json({'ok':True})
   return self.json({'error':'Nicht gefunden'},404)
  except (ValueError,KeyError,TypeError) as e:return self.json({'error':str(e)},400)
  except Exception:return self.json({'error':'Dienstfehler. Auftrag im Eingang prüfen; nicht mit neuer Kennung wiederholen.'},503)
 def translate_path(self,path):
  path=unquote(urlsplit(path).path)
  if path.startswith('/assets/gradecrew/') or path.startswith('/shared/gradecrew-design/'):
   candidate=ROOT/path.lstrip('/');allowed=ROOT/('assets/gradecrew' if path.startswith('/assets/') else 'shared/gradecrew-design')
  else:candidate=APP/(path.lstrip('/') or 'index.html');allowed=APP
  resolved=candidate.resolve()
  if not resolved.is_relative_to(allowed.resolve()) or not resolved.is_file():return str(APP/'__not_found__')
  return str(resolved)
 def end_headers(self):
  self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");super().end_headers()
 def log_message(self,*args):pass

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8796);parser.add_argument('--data-dir',type=Path,default=ROOT.parent/'.gradecrew-central');parser.add_argument('--codex');args=parser.parse_args()
 args.data_dir.mkdir(parents=True,exist_ok=True);lock=(args.data_dir/'service.lock').open('w')
 try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 except BlockingIOError:raise SystemExit('Für diesen Datenbestand läuft bereits ein Dienst.')
 server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);server.token=secrets.token_urlsafe(32);server.service=Service(ROOT,args.data_dir,args.codex)
 print(f'Firmenzentrale: http://127.0.0.1:{args.port}',flush=True)
 try:server.serve_forever()
 except KeyboardInterrupt:pass
 finally:server.service.close();server.server_close()
