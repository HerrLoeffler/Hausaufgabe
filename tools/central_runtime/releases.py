"""Read-only public Hosting observations and private, append-only review notes.
No release permission, credentials, provider calls or deployment capability.
"""
import concurrent.futures, ipaddress, json, re, socket, threading, urllib.request, uuid
from urllib.parse import urlsplit
from .store import now, encode, digest

SHA=re.compile(r'^[a-f0-9]{40}$')
HOSTS=frozenset(['gradecrew.de','hausaufgabe-staging.web.app','gradecrew-staging-2026.web.app','gradecrew-staging-2026--visual255-rjcwf436.web.app','gradecrew-staging-2026--chapters-20261020-w5x2v4cu.web.app','gradecrew-staging-2026--gradecrew-math-classroom-20261-gyuq6rlo.web.app','hausaufgabe-staging--gradecrew-math-classroom-20261016-5qhq3iqm.web.app','hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app','hausaufgabe-staging--gradecrew-test-rallye-20261013-mzzqi6g9.web.app','hausaufgabe-staging--gradecrew-binomial-20261012-y55vfkoh.web.app','hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app'])
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):raise ValueError('Weiterleitung nicht geprüft; Ziel separat zuordnen')
def public_manifest(value, project):
 if not isinstance(value,dict) or not SHA.fullmatch(str(value.get('commit',''))) or value.get('project')!=project:raise ValueError('Manifest passt nicht zur erwarteten Umgebung')
 return {k:str(value.get(k,''))[:160] for k in ['commit','version','project','environment']}
def fetch_manifest(url,project):
 u=urlsplit(url)
 if u.scheme!='https' or u.hostname not in HOSTS or u.port not in [None,443] or u.username or u.password or u.path!='/release.json' or u.query or u.fragment:raise ValueError('Adresse nicht im geprüften Register')
 addresses=socket.getaddrinfo(u.hostname,443,type=socket.SOCK_STREAM)
 if not addresses or any(not ipaddress.ip_address(x[4][0]).is_global for x in addresses):raise ValueError('Keine öffentliche Zieladresse')
 req=urllib.request.Request(url,headers={'User-Agent':'GradeCrew-Central/0.3','Accept':'application/json'})
 with urllib.request.build_opener(NoRedirect).open(req,timeout=8) as response:
  body=response.read(1000001)
  if len(body)>1000000:raise ValueError('Manifest zu groß')
  return public_manifest(json.loads(body),project)

class Releases:
 def __init__(self,store,root):
  self.store=store;self.catalog=json.loads((root/'docs/prototypes/firmenzentrale/releases.json').read_text());self.fetch=fetch_manifest;self.lock=threading.Lock();self.busy=False;self.stopped=threading.Event()
  with store.lock,store.db:store.db.execute('CREATE TABLE IF NOT EXISTS release_reviews(seq INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT UNIQUE NOT NULL,fingerprint TEXT NOT NULL,value TEXT NOT NULL)')
 def public(self):
  with self.store.lock:reviews=[json.loads(r[0]) for r in self.store.db.execute('SELECT value FROM release_reviews ORDER BY seq')]
  return {'catalog':self.catalog,'refreshing':self.busy,'observations':(self.store.source('release_observations') or {}),'reviews':reviews}
 def review(self,payload):
  fields=['id','candidate','sha','environment','check','result','reviewer','evidence']
  if not isinstance(payload,dict) or set(payload)!=set(fields) or any(not isinstance(payload[k],str) for k in fields):raise ValueError('Prüfnotiz unvollständig')
  p={k:payload[k].strip() for k in fields}
  try:
   if str(uuid.UUID(p['id']))!=p['id']:raise ValueError()
  except (ValueError,AttributeError):raise ValueError('Ungültige Speicherkennung')
  c=next((c for c in self.catalog['candidates'] if c['id']==p['candidate']),None)
  if not c or c.get('sourceConfirmed') is False or not SHA.fullmatch(p['sha']) or p['sha']!=c['sourceCommit'] or p['environment']!=c['testEnvironment']:raise ValueError('Kandidat, getestete Version und Testumgebung passen nicht zusammen')
  if p['check'] not in [x['id'] for x in c['checks']] or p['result'] not in ['passed','failed','pending']:raise ValueError('Diese Prüfung ist nicht vorgesehen')
  if not 1<=len(p['reviewer'])<=100 or not 10<=len(p['evidence'])<=3000:raise ValueError('Prüfer und konkreter Beleg (10–3000 Zeichen) erforderlich')
  fp=digest(p)
  with self.store.lock,self.store.db:
   old=self.store.db.execute('SELECT fingerprint,value FROM release_reviews WHERE id=?',(p['id'],)).fetchone()
   if old:
    if old[0]!=fp:raise ValueError('Diese Kennung gehört zu einer anderen Prüfnotiz')
    return json.loads(old[1])
   value=dict(p,at=now(),kind='user_reported');self.store.db.execute('INSERT INTO release_reviews(id,fingerprint,value) VALUES(?,?,?)',(p['id'],fp,encode(value)));return value
 def scan(self):
  observations=dict(self.store.source('release_observations') or {})
  jobs=[]
  for e in self.catalog['environments']:
   if e.get('manifest'):
    jobs.append((e['id'],e['url']+e['manifest'],e['project']))
    for i,url in enumerate(e.get('aliases',[])):jobs.append((e['id']+':alias:'+str(i),url+e['manifest'],e['project']))
  def one(job):
   ident,url,project=job;old=observations.get(ident,{})
   try:return ident,{'url':url,'lastAttempt':now(),'lastSuccess':now(),'lastGood':self.fetch(url,project),'error':None}
   except Exception as e:return ident,dict(old,url=url,lastAttempt=now(),error=str(e)[:250])
  with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
   for ident,value in pool.map(one,jobs):observations[ident]=value
  self.store.set_source('release_observations',observations)
 def refresh(self):
  if not self.lock.acquire(blocking=False):return False
  self.busy=True
  def run():
   try:self.scan()
   finally:self.busy=False;self.lock.release()
  threading.Thread(target=run,daemon=True).start();return True
 def start(self):
  def loop():
   self.refresh()
   while not self.stopped.wait(300):self.refresh()
  threading.Thread(target=loop,daemon=True).start()
 def close(self):self.stopped.set()
