"""Start or reuse the local company service; never kill a process or requeue work."""
import errno, fcntl, hashlib, http.client, json, os, socket, subprocess, sys, time
from pathlib import Path

class StartError(RuntimeError): pass

def identity(data_dir):
 return {'app':'gradecrew-central','protocol':1,'dataId':hashlib.sha256(str(Path(data_dir).resolve()).encode()).hexdigest(),'pid':os.getpid()}

def matches(value,data_dir):
 expected=identity(data_dir)
 return isinstance(value,dict) and all(value.get(k)==expected[k] for k in ('app','protocol','dataId'))

def probe(port,data_dir):
 # Direct socket HTTP: no proxy inheritance and no redirects, even on loopback.
 conn=http.client.HTTPConnection('127.0.0.1',port,timeout=2)
 try:
  conn.request('GET','/api/desktop-health');response=conn.getresponse()
  if response.status!=200:raise StartError('Der lokale Anschluss wird bereits von einem anderen oder älteren Dienst verwendet. Er wurde nicht beendet.')
  raw=response.read(4097)
  if len(raw)>4096:raise StartError('Der lokale Dienst antwortet unerwartet.')
  try:value=json.loads(raw)
  except (ValueError,UnicodeError):raise StartError('Der lokale Dienst antwortet unerwartet.')
  if not matches(value,data_dir):raise StartError('Am lokalen Anschluss läuft ein anderer Datenbestand. Er wurde nicht verändert.')
  return value
 except ConnectionRefusedError:return None
 except OSError as e:
  if e.errno==errno.ECONNREFUSED:return None
  raise StartError('Der lokale Anschluss antwortet nicht zuverlässig. Bitte erneut versuchen.') from e
 except http.client.HTTPException as e:raise StartError('Der lokale Anschluss liefert keine gültige Antwort.') from e
 finally:conn.close()

def environment(python_home):
 env={k:v for k,v in os.environ.items() if not k.startswith('PYTHON')}
 env.update(PYTHONHOME=str(python_home),PYTHONDONTWRITEBYTECODE='1',PYTHONNOUSERSITE='1',NO_PROXY='127.0.0.1,localhost',no_proxy='127.0.0.1,localhost')
 return env

def ensure(config,resources):
 data=Path(config['dataDirectory']).expanduser().resolve();port=int(config.get('port',8796))
 if not 1024<=port<=65535:raise StartError('Ungültiger lokaler Anschluss.')
 data.mkdir(parents=True,exist_ok=True,mode=0o700)
 with (data/'desktop-launch.lock').open('a') as lock:
  # Bounded lock acquisition: another app opening must not hang this window.
  deadline=time.monotonic()+25
  while True:
   try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);break
   except BlockingIOError:
    if time.monotonic()>deadline:raise StartError('Ein anderer Start läuft noch. Bitte gleich erneut versuchen.')
    time.sleep(.1)
  current=probe(port,data)
  if current:return {'url':f'http://127.0.0.1:{port}','pid':current['pid'],'reused':True}
  python_home=resources/'Python';python=python_home/'bin/python3.12';workspace=resources/'Workspace'
  if not python.is_file() or not (workspace/'tools/serve_firmenzentrale.py').is_file():raise StartError('Das App-Paket ist unvollständig. Bitte die App neu bauen.')
  log=data/'desktop-service.log'
  if log.exists() and log.stat().st_size>1048576:log.replace(data/'desktop-service.previous.log')
  with log.open('ab') as output:
   os.chmod(log,0o600)
   args=[str(python),'-s',str(workspace/'tools/serve_firmenzentrale.py'),'--data-dir',str(data),'--port',str(port)]
   codex=config.get('codex')
   if codex:args+=['--codex',codex]
   process=subprocess.Popen(args,cwd=data,env=environment(python_home),stdin=subprocess.DEVNULL,stdout=output,stderr=output,start_new_session=True,close_fds=True)
  deadline=time.monotonic()+20
  while time.monotonic()<deadline:
   current=probe(port,data)
   if current:return {'url':f'http://127.0.0.1:{port}','pid':current['pid'],'reused':False}
   if process.poll() is not None:raise StartError('Der lokale Dienst konnte nicht starten. Der bestehende Datenbestand bleibt erhalten. Details stehen im lokalen Dienstprotokoll.')
   time.sleep(.1)
  raise StartError('Der Start dauert noch. Bitte erneut versuchen; ein laufender Start wird nicht doppelt ausgeführt.')

if __name__=='__main__':
 try:
  resources=Path(sys.argv[1]).resolve();config=json.loads((resources/'application.json').read_text())
  print(json.dumps(ensure(config,resources)))
 except Exception as e:
  print(json.dumps({'error':str(e) if isinstance(e,StartError) else 'Die App konnte den lokalen Dienst nicht starten. Bitte Paket und Datenordner prüfen.'}));sys.exit(1)
