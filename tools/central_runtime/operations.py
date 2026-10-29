"""Stable work/owner bindings in the existing store. Observations never grant rights."""
import json, threading, time, uuid, re
from pathlib import Path
from .store import now, digest, encode

class Operations:
 def __init__(self,store,root,rpc=None,host=None,start=True,clock=now,reminders=False):
  self.reminders=reminders;self.clock=clock;self.store=store;self.root=Path(root);self.rpc=rpc;self.host=host;self.lock=threading.RLock();self.refresh_lock=threading.Lock();self.stop=threading.Event();self.error='';self.busy=False
  self.catalog=json.loads((self.root/'docs/prototypes/firmenzentrale/operations.json').read_text());self.owners={x['id']:x for x in self.catalog['owners']};self.domains=set(self.catalog.get('domainIds',[]))
  with store.lock,store.db:store.db.execute('CREATE TABLE IF NOT EXISTS work_items(id TEXT PRIMARY KEY,value TEXT NOT NULL)')
  self.seed()
  if start:threading.Thread(target=self.loop,daemon=True).start()
 def seed(self):
  with self.lock,self.store.lock,self.store.db:
   for item in self.catalog['items']:
    ident=str(uuid.uuid5(uuid.NAMESPACE_URL,'gradecrew-work:'+item['key']))
    existing=self.store.db.execute('SELECT value FROM work_items WHERE id=?',(ident,)).fetchone()
    if existing:
     old=json.loads(existing[0])
     if item.get('handoffHistory') and 'handoffHistory' not in old:self.save(dict(old,handoffHistory=item['handoffHistory']),'source_history_added',{'source':item['source']})
     continue
    value=dict(item,id=ident,revision=1,delivery='assigned',createdAt=now(),updatedAt=now(),ownerConversationId=self.owners[item['ownerId']]['conversationId'])
    self.store.db.execute('INSERT INTO work_items VALUES(?,?)',(ident,encode(value)));self.store._event('work/'+ident,'assigned',{'ownerId':item['ownerId'],'source':item['source']})
 def items(self):
  with self.store.lock:return sorted([json.loads(v[0]) for v in self.store.db.execute('SELECT value FROM work_items')],key=lambda v:(v['priority'],v['createdAt']))
 def get(self,ident):
  with self.store.lock:
   row=self.store.db.execute('SELECT value FROM work_items WHERE id=?',(ident,)).fetchone()
   if not row:raise ValueError('Auftrag nicht gefunden')
   return json.loads(row[0])
 def save(self,value,event,detail):
  value=dict(value,revision=value['revision']+1,updatedAt=now())
  self.store.db.execute('UPDATE work_items SET value=? WHERE id=?',(encode(value),value['id']));self.store._event('work/'+value['id'],event,detail);return value
 def checked(self,payload):
  if not isinstance(payload,dict):raise ValueError('Anfrage ungültig')
  value=self.get(payload.get('id'))
  if payload.get('revision')!=value['revision']:raise ValueError('Der Auftrag wurde inzwischen geändert. Bitte neu laden.')
  return value
 def change(self,payload):
  with self.lock,self.store.lock,self.store.db:
   value=self.checked(payload);changes={}
   for key in ['next','scope','gap']:
    if key in payload:
     if not isinstance(payload[key],str) or not payload[key].strip() or len(payload[key])>4000:raise ValueError('Bitte einen kurzen konkreten Text eingeben.')
     changes[key]=payload[key].strip()
   if 'priority' in payload:
    if type(payload['priority']) is not int or not 1<=payload['priority']<=99:raise ValueError('Ungültige Priorität')
    changes['priority']=payload['priority']
   if 'ownerId' in payload and payload['ownerId']!=value['ownerId']:
    owner=self.owners.get(payload['ownerId'])
    if not owner or owner['role']!='implementer' or value['domainId'] not in owner['domains']:raise ValueError('Dieser Chat ist für diese Umsetzung nicht zuständig. Zentralen koordinieren ausschließlich.')
    cp=payload.get('checkpoint')
    if not isinstance(cp,dict) or not re.fullmatch(r'[a-f0-9]{7,40}',cp.get('commit','')) or any(not isinstance(cp.get(k),str) or not cp[k].strip() for k in ['branch','handoff','files','attempts','unfinished']) or not payload.get('scope'):raise ValueError('Vor dem Wechsel: Commit, Branch, Übergabe, Dateigrenzen, Versuche und offene Läufe sichern; neuen Umfang angeben.')
    if value.get('delivery') in ['sending','sent','unknown']:raise ValueError('Eine offene Übermittlung zuerst im bisherigen Chat klären. Kein zweiter Start.')
    changes.update(ownerId=owner['id'],ownerConversationId=owner['conversationId'],checkpoint=cp,delivery='assigned',originTurnId=None,acknowledgementItemId=None)
   if not changes:raise ValueError('Keine Änderung angegeben')
   return self.save(dict(value,**changes),'assignment_changed',changes)
 def decide(self,payload):
  with self.lock,self.store.lock,self.store.db:
   value=self.checked(payload);answer=payload.get('answer','').strip()
   if not value.get('decision') or not answer or len(answer)>4000:raise ValueError('Bitte die konkrete Frage beantworten.')
   decision=dict(value['decision'],answer=answer,state='answered',answeredAt=now(),actor='Martin');return self.save(dict(value,decision=decision),'human_decision',decision)
 def create(self,payload):
  if not isinstance(payload,dict):raise ValueError('Auftrag fehlt')
  try:ident=str(uuid.UUID(payload['id']))
  except (ValueError,KeyError,TypeError):raise ValueError('Auftragskennung fehlt')
  domain=payload.get('domainId');topic=payload.get('topicId');owner=self.owners.get(payload.get('ownerId'))
  if not owner or owner['role']!='implementer' or domain not in owner['domains']:raise ValueError('Passenden ausführenden Fachchat auswählen.')
  if domain not in {d for o in self.owners.values() for d in o['domains']} or not isinstance(topic,str) or len(topic)>80:raise ValueError('Bereich oder Unterpunkt fehlt')
  fields={k:payload.get(k,'') for k in ['title','scope','next']}
  if any(not isinstance(v,str) or not v.strip() or len(v)>4000 for v in fields.values()) or len(fields['title'])>160:raise ValueError('Titel, genauer Umfang und nächster Schritt sind erforderlich.')
  fingerprint=digest([domain,topic,owner['id'],fields])
  with self.lock,self.store.lock,self.store.db:
   row=self.store.db.execute('SELECT value FROM work_items WHERE id=?',(ident,)).fetchone()
   if row:
    value=json.loads(row[0])
    if value.get('fingerprint')!=fingerprint:raise ValueError('Diese Kennung gehört zu einem anderen Auftrag.')
    return value
   value=dict(id=ident,key=ident,externalTaskId=payload.get('externalTaskId') or None,domainId=domain,topicId=topic,ownerId=owner['id'],ownerConversationId=owner['conversationId'],**fields,priority=9,gap='Aufnahme durch den Fachchat noch nicht belegt.',revision=1,delivery='assigned',createdAt=now(),updatedAt=now(),source={'kind':'user_assignment','at':now()},fingerprint=fingerprint,environment='not-selected')
   self.store.db.execute('INSERT INTO work_items VALUES(?,?)',(ident,encode(value)));self.store._event('work/'+ident,'assigned',{'ownerId':owner['id']});return value
 def observe(self,owner_id,metadata,turns,live=False):
  owner=self.owners.get(owner_id)
  if not owner or metadata.get('thread',{}).get('id')!=owner['conversationId']:raise ValueError('Chatantwort passt nicht zur Zuordnung')
  thread=metadata['thread'];messages=[];tools=[];records=turns.get('data',[])
  for turn in reversed(records):
   for item in turn.get('items',[]):
    kind=item.get('type');ident=item.get('id')
    if kind in ['agentMessage','userMessage']:
     text=item.get('text') or '\n'.join(x.get('text','') for x in item.get('content',[]) if isinstance(x,dict) and x.get('type')=='text')
     if text:messages.append({'id':ident,'turnId':turn['id'],'role':'assistant' if kind=='agentMessage' else 'user','phase':item.get('phase'),'text':text[:10000],'contentHash':digest(text.strip())})
    elif kind in ['commandExecution','mcpToolCall','fileChange']:tools.append({'id':ident,'turnId':turn['id'],'kind':kind,'status':item.get('status')})
  latest=records[0] if records else {};agent=[x for x in messages if x['role']=='assistant' and x['turnId']==latest.get('id')]
  raw_status=thread.get('status',{}).get('type','unknown')
  # A standalone reader's notLoaded/interrupted archive is not the desktop session state.
  activity=raw_status if live and raw_status in ['idle','active','systemError'] else 'unknown'
  value={'title':thread.get('name') or owner['title'],'readAt':now(),'sourceUpdatedAt':thread.get('updatedAt'),'conversationId':owner['conversationId'],'activity':activity,'live':bool(live),'rawStatus':raw_status,'turn':{k:latest.get(k) for k in ['id','status','startedAt','completedAt']},'lastMessage':agent[-1] if agent else None,'messages':messages[-30:],'tools':tools[-8:],'error':None,'coverage':'Letzte zwei Läufe; Textmeldungen gekürzt. Archivstatus ist kein Beleg für laufende Desktoparbeit.'}
  revision=digest([owner_id,messages]);self.store.index_messages(revision,owner['conversationId'],owner['title'],[(m['id'] or digest(m),m['text']) for m in messages]);value['revision']=revision
  # Retain exact acknowledgement witnesses separately; no keyword-based acceptance.
  old=(self.store.source('ops:'+owner_id) or {}).get('data',{});witnesses=dict(old.get('acknowledgements',{}))
  for task in self.items():
   if task['ownerId']!=owner_id:continue
   for m in messages:
    if task.get('acknowledgementItemId')==m['id'] and task.get('originTurnId')==m['turnId'] and m['role']=='assistant':witnesses[task['id']]={'itemId':m['id'],'turnId':m['turnId'],'readAt':value['readAt'],'text':m['text']}
  value['acknowledgements']=witnesses
  for task in self.items():
   if task['ownerId']!=owner_id or task.get('delivery')!='prepared':continue
   for m in messages:
    if m['role']=='user' and m.get('contentHash')==task.get('preparedEnvelopeHash'):
     with self.lock,self.store.lock,self.store.db:
      current=self.get(task['id'])
      if current.get('delivery')=='prepared':self.save(dict(current,delivery='sent',executionRef={'threadId':owner['conversationId'],'turnId':m['turnId'],'requestId':current['dispatchRequestId'],'userItemId':m['id'],'transport':'manual-copy'}),'dispatch_receipt',{'turnId':m['turnId'],'userItemId':m['id'],'source':'exact-bound-user-message'})
     break
  self.store.set_source('ops:'+owner_id,{'lastAttempt':now(),'lastSuccess':now(),'error':None,'data':value});return value
 def refresh(self,force=False):
  reader=self.host if self.host and self.host.ready else self.rpc
  if not reader or not self.refresh_lock.acquire(blocking=False):return False
  self.busy=True
  def run():
   try:
    for ident,owner in self.owners.items():
     if self.stop.is_set():break
     if not any(t['ownerId']==ident for t in self.items()):continue
     try:
      meta=reader.call('thread/read',{'threadId':owner['conversationId'],'includeTurns':False},timeout=15)
      old=self.store.source('ops:'+ident) or {};previous=old.get('data',{})
      if not force and previous.get('sourceUpdatedAt') is not None and previous.get('sourceUpdatedAt')==meta.get('thread',{}).get('updatedAt') and not old.get('error'):
       self.store.set_source('ops:'+ident,dict(old,lastAttempt=now(),lastChecked=now()));continue
      turns=reader.call('thread/turns/list',{'threadId':owner['conversationId'],'limit':2,'itemsView':'full'},timeout=20)
      self.observe(ident,meta,turns,live=reader is self.host)
     except Exception as e:
      old=self.store.source('ops:'+ident) or {};self.store.set_source('ops:'+ident,dict(old,lastAttempt=now(),error=str(e)[:300]))
   finally:self.busy=False;self.refresh_lock.release()
  threading.Thread(target=run,daemon=True).start();return True
 def loop(self):
  while not self.stop.wait(60):self.refresh()
 def public(self):
  self.tick()
  owners=[];observed={}
  for owner in self.owners.values():
   source=self.store.source('ops:'+owner['id']) or {};data=dict(source.get('data',{}));data['error']=source.get('error');data['checkedAt']=source.get('lastChecked') or source.get('lastSuccess');observed[owner['id']]=data
   slim={k:v for k,v in data.items() if k not in ['messages','tools','acknowledgements']}
   if slim.get('lastMessage'):slim['lastMessage']=dict(slim['lastMessage'],text=slim['lastMessage']['text'][:1800])
   owners.append({**owner,**slim,'activity':data.get('activity','unknown') if not source.get('error') else 'unknown'})
  items=[]
  for value in self.items():
   obs=next(x for x in owners if x['id']==value['ownerId']);ack=observed[value['ownerId']].get('acknowledgements',{}).get(value['id']);public_value={k:v for k,v in value.items() if k not in ['preparedEnvelope','preparedEnvelopeHash','dispatchHash']}
   item=dict(public_value,acknowledgement=ack and {k:v for k,v in ack.items() if k!='text'},observation=obs)
   items.append(item)
  return {'items':items,'owners':owners,'refreshing':self.busy,'host':{'connected':bool(self.host and self.host.ready),'error':getattr(self.host,'error','Desktop-Steueranschluss nicht verbunden. Bestehende Chats werden nur gelesen; kein zweiter Lauf wird gestartet.')},'limits':['Auftragszuordnung ist kein Startbeleg.','Chatstatus, fachlicher Abschluss und Veröffentlichung bleiben getrennt.','Nicht zugeordnete historische Aufträge bleiben im Eingang erhalten.']}
 def dispatch(self,payload):
  with self.lock,self.store.lock,self.store.db:
   value=self.checked(payload);message=payload.get('message','')
   if not isinstance(message,str) or not message.strip() or len(message)>12000:raise ValueError('Bitte eine Nachricht mit höchstens12000Zeichen eingeben.')
   try:request_id=str(uuid.UUID(payload.get('requestId','')))
   except (ValueError,TypeError):raise ValueError('Übermittlungskennung fehlt')
   owner=self.owners[value['ownerId']]
   if owner['role']!='implementer':raise ValueError('Zentralen koordinieren; keine Implementierung an diesen Chat senden.')
   if value.get('delivery') in ['prepared','sending','sent','unknown']:raise ValueError('Diese Übermittlung zuerst im zugeordneten Chat prüfen. Kein Doppelstart.')
   if not self.host or not self.host.ready:raise ValueError('Desktop-Steueranschluss nicht erreichbar. Zuordnung gespeichert; Nachricht noch nicht gesendet. Den bestehenden Fachchat öffnen oder Anschluss prüfen.')
   other=[t for t in self.items() if t['ownerId']==owner['id'] and t['id']!=value['id'] and t.get('delivery') in ['sending','sent','unknown']]
   if other:raise ValueError('In diesem Chat ist bereits ein anderer Auftrag offen. Zuerst dessen Übergabe klären.')
   # The shared desktop host must already own the loaded idle thread. Never resume it here.
   metadata=self.host.call('thread/read',{'threadId':owner['conversationId'],'includeTurns':False})
   if metadata.get('thread',{}).get('status',{}).get('type')!='idle':raise ValueError('Der Fachchat ist beschäftigt oder sein laufender Host ist nicht eindeutig erreichbar. Nachricht bleibt ungesendet.')
   value=self.save(dict(value,delivery='sending',dispatchRequestId=request_id,dispatchHash=digest(message)),'dispatch_intent',{'requestId':request_id,'ownerConversationId':owner['conversationId']})
  try:
   result=self.host.call('turn/start',{'threadId':owner['conversationId'],'input':[{'type':'text','text':f"Gebundener Auftrag {value['externalTaskId'] or value['id']}\nBereich {value['domainId']}/{value['topicId']}\nUmfang: {value['scope']}\n\n{message}\n\nBestehende Übergabe, Schreibgrenzen, Versuche und Freigaben beachten. Kein Liveauftrag aus dieser Nachricht."}],'clientUserMessageId':request_id},timeout=45)
   with self.lock,self.store.lock,self.store.db:return self.save(dict(self.get(value['id']),delivery='sent',executionRef={'threadId':owner['conversationId'],'turnId':result['turn']['id'],'requestId':request_id}),'dispatch_receipt',{'turnId':result['turn']['id']})
  except Exception:
   with self.lock,self.store.lock,self.store.db:self.save(dict(self.get(value['id']),delivery='unknown'),'dispatch_uncertain',{'requestId':request_id})
   raise ValueError('Übermittlung nicht sicher bestätigt. Im bestehenden Chat prüfen; nicht erneut starten.')
 def close(self):self.stop.set()
 def deadline(self,item):
  from datetime import datetime,timedelta
  anchor=item.get('lastProgressAt') or item.get('assignedAt') or item['createdAt']
  try:
   explicit=item.get('reviewAt')
   if explicit:return datetime.fromisoformat(explicit.replace('Z','+00:00'))
   base=datetime.fromisoformat(anchor.replace('Z','+00:00'));return base+timedelta(hours=2 if item['priority']==1 else 120)
  except (ValueError,TypeError):return None
 def tick(self):
  if not self.reminders:return
  from datetime import datetime
  current=datetime.fromisoformat(self.clock().replace('Z','+00:00'))
  with self.lock,self.store.lock,self.store.db:
   for item in self.items():
    if item.get('archived') or item.get('closed'):continue
    due=self.deadline(item)
    if not due or current<due:continue
    key=digest([item['id'],due.isoformat(),item.get('lastProgressAt')])
    if item.get('reminder',{}).get('key')==key:continue
    self.save(dict(item,reminder={'key':key,'at':self.clock(),'dueAt':due.isoformat(),'state':'open'}),'review_due',{'key':key,'dueAt':due.isoformat()})
 def review_action(self,payload):
  if not self.reminders:raise ValueError('Wiedervorlage ist eine noch nicht freigegebene Produktidee.')
  from datetime import datetime,timedelta
  with self.lock,self.store.lock,self.store.db:
   item=self.checked(payload);action=payload.get('action');changes={}
   if action in ['continue','question']:
    changes={'reviewAt':(datetime.fromisoformat(self.clock())+timedelta(hours=2 if item['priority']==1 else 120)).isoformat(),'reminder':{},'followupPrepared':action=='question'}
   elif action=='snooze':
    try:until=datetime.fromisoformat(payload['until'].replace('Z','+00:00'))
    except (ValueError,KeyError,TypeError):raise ValueError('Bitte ein gültiges Wiedervorlagedatum wählen.')
    if until<=datetime.fromisoformat(self.clock()):raise ValueError('Die Wiedervorlage muss in der Zukunft liegen.')
    changes={'reviewAt':until.isoformat(),'reminder':{},'snoozeReason':str(payload.get('reason',''))[:1000]}
   elif action=='archive':
    reason=payload.get('reason','')
    if not isinstance(reason,str) or not reason.strip():raise ValueError('Bitte einen Grund für das Archivieren angeben.')
    changes={'archived':{'at':self.clock(),'reason':reason[:2000]},'reminder':{}}
   elif action=='restore':changes={'archived':None,'reviewAt':(datetime.fromisoformat(self.clock())+timedelta(days=5)).isoformat(),'reminder':{}}
   else:raise ValueError('Unbekannte Wiedervorlageaktion')
   return self.save(dict(item,**changes),'review_'+action,changes)
 def progress(self,payload):
  with self.lock,self.store.lock,self.store.db:
   item=self.checked(payload);obs=(self.store.source('ops:'+item['ownerId']) or {}).get('data',{});source=next((m for m in obs.get('messages',[]) if m['id']==payload.get('itemId') and m['role']=='assistant'),None)
   if not source:raise ValueError('Diese Fortschrittsmeldung ist nicht mehr im gelesenen Fachchat belegt. Bitte neu prüfen.')
   # Explicit human confirmation, not automated interpretation of arbitrary chat text.
   assessment=payload.get('assessment','checkpoint')
   if assessment not in ['checkpoint','blocked','candidate','waiting_human']:raise ValueError('Ungültige Einordnung')
   changes={k:payload[k].strip() for k in ['next','gap'] if isinstance(payload.get(k),str) and payload[k].strip() and len(payload[k])<=4000}
   value=dict(item,**changes,assessment={'state':assessment,'sourceItemId':source['id'],'actor':'Zentrale','at':self.clock()},lastProgressAt=self.clock(),progressEvidence={'conversationId':item['ownerConversationId'],'turnId':source['turnId'],'itemId':source['id'],'text':source['text'],'confirmedBy':'In der Zentrale festgehalten','at':self.clock()},reviewAt=None,reminder={})
   return self.save(value,'progress_confirmed',value['progressEvidence'])
 def detail(self,ident):
  item=self.get(ident);source=self.store.source('ops:'+item['ownerId']) or {};return {'item':item,'owner':self.owners[item['ownerId']],'observation':source.get('data',{}),'error':source.get('error'),'events':self.store.events('work/'+ident)}

 def prepare_handoff(self,payload):
  with self.lock,self.store.lock,self.store.db:
   task=self.checked(payload);message=payload.get('message','')
   if not isinstance(message,str) or not message.strip() or len(message)>12000:raise ValueError('Bitte eine konkrete Nachricht eingeben.')
   if task.get('delivery') in ['sending','sent','unknown']:raise ValueError('Vorige Übermittlung zuerst im Fachchat klären. Kein zweiter Auftrag.')
   fingerprint=digest(message)
   if task.get('delivery')=='prepared':
    if task.get('dispatchHash')!=fingerprint:raise ValueError('Eine andere Übergabe ist bereits vorbereitet. Zuerst deren Zustand im Fachchat klären.')
    return {'text':task['preparedEnvelope'],'requestId':task['dispatchRequestId'],'reused':True}
   request_id=str(uuid.uuid4())
   text=f"[GradeCrew Auftrag {task['id']} / Übergabe {request_id}]\nOriginaltask: {task.get('externalTaskId') or 'mit bestehender Übergabe abgleichen'}\nBereich: {task['domainId']}/{task['topicId']}\nZuständiger Chat: {task['ownerConversationId']}\nTitel: {task['title']}\nUmfang: {task['scope']}\nZielumgebung: {task.get('environment','nicht ausgewählt')} (keine neue Freigabe)\nNächster Schritt: {task['next']}\n\n{message.strip()}\n\nBestehenden Stand, Schreibgrenzen, laufende Vorgänge, Versuche und Budget bewahren. Diese Nachricht erteilt keine neue Live-/Providerfreigabe. Bei unpassendem Scope Aufnahme klären, nicht parallel neu anfangen."
   self.save(dict(task,delivery='prepared',dispatchRequestId=request_id,dispatchHash=fingerprint,preparedEnvelope=text,preparedEnvelopeHash=digest(text.strip())),'handoff_prepared',{'requestId':request_id,'ownerConversationId':task['ownerConversationId']})
   return {'text':text,'requestId':request_id,'reused':False}
