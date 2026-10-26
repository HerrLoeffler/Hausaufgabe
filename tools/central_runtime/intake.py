"""Durable single company inbox. A saved message is never a delivery claim."""
import json,threading,uuid
from .store import now,encode,digest

COORDINATOR='01a10df6-736b-7a62-bd38-2724cf254c2e'
PENDING={'saved','waiting_connection','waiting_coordinator'}

class Intake:
 def __init__(self,store,host=None,reader=None):
  self.store=store;self.host=host;self.reader=reader;self.router=None;self.tick_lock=threading.Lock()
  with store.lock,store.db:store.db.execute('CREATE TABLE IF NOT EXISTS central_intake(id TEXT PRIMARY KEY,value TEXT NOT NULL)')
 def items(self):
  with self.store.lock:return [json.loads(r[0]) for r in self.store.db.execute('SELECT value FROM central_intake ORDER BY rowid DESC')]
 def get(self,ident):
  with self.store.lock:
   r=self.store.db.execute('SELECT value FROM central_intake WHERE id=?',(ident,)).fetchone()
   if not r:raise ValueError('Anliegen nicht gefunden')
   return json.loads(r[0])
 def submit(self,payload):
  if not isinstance(payload,dict) or set(payload)!={'id','text'}:raise ValueError('Bitte nur das Anliegen eingeben.')
  try:ident=str(uuid.UUID(payload['id']))
  except (ValueError,TypeError,AttributeError):raise ValueError('Kennung fehlt')
  text=payload['text']
  if not isinstance(text,str) or not text.strip() or len(text)>12000:raise ValueError('Bitte ein Anliegen mit höchstens 12.000 Zeichen eingeben.')
  text=text.strip()
  with self.store.lock,self.store.db:
   old=self.store.db.execute('SELECT value FROM central_intake WHERE id=?',(ident,)).fetchone()
   if old:
    value=json.loads(old[0])
    if value['text']!=text:raise ValueError('Diese Kennung gehört zu einem anderen Anliegen.')
    return value
   if sum(x['state'] not in ['answered','needs_attention'] for x in self.items())>=20:raise ValueError('Bitte zuerst die offenen Anliegen klären.')
   value={'id':ident,'text':text,'state':'saved','coordinatorId':COORDINATOR,'createdAt':now(),'updatedAt':now(),'result':'','attempts':0}
   self.store.db.execute('INSERT INTO central_intake VALUES(?,?)',(ident,encode(value)));self.store._event('intake/'+ident,'accepted',{'textHash':digest(text)})
   return value
 def update(self,item,**changes):
  with self.store.lock,self.store.db:
   current=self.get(item['id'])
   if all(current.get(k)==v for k,v in changes.items()):return current
   current.update(changes,updatedAt=now());self.store.db.execute('UPDATE central_intake SET value=? WHERE id=?',(encode(current),item['id']));self.store._event('intake/'+item['id'],'state',{'state':current['state'],'turnId':current.get('turnId')});return current
 def tick(self):
  if not self.tick_lock.acquire(blocking=False):return
  try:
   if self.router:self.router.tick();return
   jobs=self.items()
   # One coordinator task at a time; timeout/start interruption never replays it.
   active=next((x for x in reversed(jobs) if x['state'] in ['sending','running','unknown']),None)
   if active:
    if active['state']=='sending':self.update(active,state='unknown',error='Startbestätigung fehlt. Kein automatischer zweiter Start.')
    elif active['state']=='running':self.collect(active)
    return
   item=next((x for x in reversed(jobs) if x['state'] in PENDING),None)
   if not item:return
   if not self.host or not self.host.ready:
    self.update(item,state='waiting_connection',error='Anliegen gespeichert. Der direkte Zentralenanschluss ist noch nicht verbunden; nichts wurde gesendet.');return
   try:
    meta=self.host.call('thread/read',{'threadId':COORDINATOR,'includeTurns':False},timeout=10).get('thread',{})
    if meta.get('id')!=COORDINATOR or meta.get('status',{}).get('type')!='idle':
     self.update(item,state='waiting_coordinator',error='Die Zentrale bearbeitet noch einen anderen Vorgang. Dieses Anliegen wartet.');return
   except Exception:
    self.update(item,state='waiting_connection',error='Der Zentralenanschluss ist gerade nicht erreichbar. Das Anliegen bleibt gespeichert.');return
   prompt=f"[GradeCrew Zentralenanliegen {item['id']}]\nMartin hat dieses Anliegen in der lokalen Firmenzentrale eingegeben. Übernimm die Koordination: vorhandene Zuständigkeit und Quellen prüfen, den ausführenden Fachchat mit gebundenem Kontext beauftragen, auf dessen Ergebnis warten und den geprüften Stand in diesem Vorgang zurückmelden. Martin muss keinen Fachchat bedienen. Nicht selbst implementieren. Bei Mehrdeutigkeit eine konkrete Rückfrage stellen. Vorhandene Tasks, Schreibgrenzen, laufende Vorgänge und Versuche bewahren. Keine Liveänderung und keine neue pauschale Freigabe.\n\nAnliegen:\n{item['text']}\n\nKennung in Rückfragen und Ergebnis beibehalten. Eine Abschlussmeldung nennt Fachchat, Arbeitsergebnis, Nachweise, offene Punkte und nächsten Schritt; kein Erfolg nur aus Versand ableiten."
   self.update(item,state='sending',attempts=item['attempts']+1,error='',dispatchHash=digest(prompt))
   try:
    result=self.host.call('turn/start',{'threadId':COORDINATOR,'input':[{'type':'text','text':prompt}],'clientUserMessageId':item['id']},timeout=45)
    turn=result.get('turn',{}).get('id')
    if not turn:raise ValueError('No exact receipt')
    self.update(item,state='running',turnId=turn,error='')
   except Exception:self.update(item,state='unknown',error='Versand nicht sicher bestätigt. Kein automatischer zweiter Start; der vorhandene Vorgang muss abgeglichen werden.')
  finally:self.tick_lock.release()
 def collect(self,item):
  reader=self.reader or self.host
  if not reader:return
  try:
   # Exact turn binding; unrelated later chat replies can never become this result.
   page=reader.call('thread/turns/list',{'threadId':COORDINATOR,'limit':100,'itemsView':'summary'},timeout=20)
   turn=next((t for t in page.get('data',[]) if t.get('id')==item['turnId']),None)
   if not turn:return
   items=reader.call('thread/items/list',{'threadId':COORDINATOR,'turnId':item['turnId'],'limit':30,'sortDirection':'descending'},timeout=20)
   messages=[entry['item'] for entry in reversed(items.get('data',[])) if entry.get('turnId')==item['turnId'] and entry.get('item',{}).get('type')=='agentMessage' and entry['item'].get('text')]
   final=next((m for m in reversed(messages) if m.get('phase')=='final_answer'),None)
   if turn.get('status')=='completed' and final:self.update(item,state='answered',result=final['text'][:64000],resultItemId=final['id'] if 'id' in final else None,error='')
   elif turn.get('status') in ['failed','interrupted']:self.update(item,state='needs_attention',error='Der gebundene Lauf wurde unterbrochen oder ist fehlgeschlagen. Bestehenden Stand klären; kein automatischer Neustart.')
   elif messages:self.update(item,progress=messages[-1]['text'][:3000])
  except Exception:self.update(item,error='Ergebnisabgleich vorübergehend nicht erreichbar. Der Auftrag wird nicht erneut gesendet.')
