"""Private durable requests. No credentials or provider tokens are stored here."""
import hashlib, json, os, sqlite3, threading, uuid
from datetime import datetime, timezone

def now(): return datetime.now(timezone.utc).isoformat()
def encode(value): return json.dumps(value, ensure_ascii=False, sort_keys=True)
def digest(value): return hashlib.sha256(encode(value).encode()).hexdigest()

class Store:
 def __init__(self, root):
  self.root=root;root.mkdir(parents=True,exist_ok=True);os.chmod(root,0o700)
  self.lock=threading.RLock();self.db=sqlite3.connect(root/'central.sqlite',check_same_thread=False)
  os.chmod(root/'central.sqlite',0o600)
  self.db.executescript('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT, at TEXT, kind TEXT, value TEXT); CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS knowledge(revision TEXT, thread_id TEXT, item_id TEXT, title TEXT, body TEXT, truncated INTEGER, PRIMARY KEY(revision,item_id));')
 def close(self): self.db.close()
 def get(self, ident):
  with self.lock:
   row=self.db.execute('SELECT value FROM requests WHERE id=?',(ident,)).fetchone()
   if not row: raise KeyError(ident)
   return json.loads(row[0])
 def list(self):
  with self.lock:return [json.loads(r[0]) for r in self.db.execute('SELECT value FROM requests ORDER BY rowid DESC')]
 def create(self, payload, context):
  if not isinstance(payload,dict):raise ValueError('Ungültiger Auftrag')
  ident=payload.get('requestId','')
  try:
   if str(uuid.UUID(ident))!=ident:raise ValueError()
  except (ValueError,TypeError,AttributeError):raise ValueError('Ungültige Auftragskennung')
  brief={k:payload.get(k,'') for k in ['title','body','area']}
  if any(not isinstance(v,str) for v in brief.values()) or not brief['title'].strip() or len(brief['title'])>160 or len(brief['body'])>12000 or len(brief['area'])>80:raise ValueError('Titel fehlt oder Text ist zu lang')
  fp=digest(brief)
  with self.lock,self.db:
   row=self.db.execute('SELECT fingerprint,value FROM requests WHERE id=?',(ident,)).fetchone()
   if row:
    if row[0]!=fp:raise ValueError('Diese Kennung gehört bereits zu einem anderen Auftrag')
    return json.loads(row[1])
   if sum(r['status'] in ['queued','starting','running','waiting_user'] for r in self.list())>=10:raise ValueError('Warteschlange voll. Bitte laufende Aufgaben abwarten.')
   value=dict(id=ident,**brief,context=context,briefHash=digest([brief,context]),status='queued',createdAt=now(),updatedAt=now(),threadId=None,turnId=None,attempts=0,result='',error='',question=None,report=None,usage=None,profile='Analyse und Bericht · keine Produktänderungen')
   self.db.execute('INSERT INTO requests VALUES(?,?,?)',(ident,fp,encode(value)));self._event(ident,'accepted',{'briefHash':value['briefHash']})
   return value
 def _event(self, ident, kind, data):self.db.execute('INSERT INTO events(request_id,at,kind,value) VALUES(?,?,?,?)',(ident,now(),kind,encode(data)))
 def event(self, ident, kind, data):
  with self.lock,self.db:self._event(ident,kind,data)
 def events(self, ident):
  with self.lock:return [dict(seq=r[0],at=r[1],kind=r[2],data=json.loads(r[3])) for r in self.db.execute('SELECT seq,at,kind,value FROM events WHERE request_id=? ORDER BY seq',(ident,))]
 def update(self, ident, **fields):
  with self.lock,self.db:
   value=self.get(ident);value.update(fields,updatedAt=now());self.db.execute('UPDATE requests SET value=? WHERE id=?',(encode(value),ident));self._event(ident,'update',fields);return value
 def source(self, ident):
  with self.lock:
   row=self.db.execute('SELECT value FROM sources WHERE id=?',(ident,)).fetchone();return json.loads(row[0]) if row else None
 def set_source(self, ident, value):
  with self.lock,self.db:self.db.execute('INSERT INTO sources VALUES(?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',(ident,encode(value)))

 def index_messages(self, revision, thread_id, title, messages):
  with self.lock,self.db:
   for message in messages:
    item_id,text=message[:2];source_truncated=bool(message[2]) if len(message)>2 else False
    self.db.execute('INSERT OR IGNORE INTO knowledge VALUES(?,?,?,?,?,?)',(revision,thread_id,item_id,title,text[:24000],int(source_truncated or len(text)>24000)))
 def search_knowledge(self, query, revisions, limit=8):
  if not revisions or not query.strip():return []
  import re
  words=re.findall(r"[\w-]+",query.lower())[:8]
  if not words:return []
  with self.lock:
   rows=self.db.execute('SELECT revision,thread_id,item_id,title,body,truncated FROM knowledge WHERE revision IN ('+','.join('?' for _ in revisions)+')',revisions).fetchall()
  scored=[]
  for r in rows:
   text=r[4];score=sum((2 if w in r[3].lower() else 0)+(1 if w in text.lower() else 0) for w in words)
   if score:
    pos=min([text.lower().find(w) for w in words if w in text.lower()] or [0]);start=max(0,pos-300)
    scored.append((score,{'revision':r[0],'threadId':r[1],'itemId':r[2],'title':r[3],'excerpt':text[start:start+3000],'truncated':bool(r[5]) or len(text)>3000}))
  result=[];seen=set()
  for _,item in sorted(scored,key=lambda x:x[0],reverse=True):
   key=item['excerpt']
   if key in seen:continue
   seen.add(key);result.append(item)
   if len(result)>=limit:break
  return result
