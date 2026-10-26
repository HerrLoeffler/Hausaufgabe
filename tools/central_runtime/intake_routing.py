"""Own coordination and specialist conversations, using the existing bounded broker."""
import json,re,uuid

LABELS={'web':'Tests erstellen & auswerten','classroom':'Schulen, Klassen & Zugänge','native':'iPhone, iPad & Secure','games':'Games & Lernwelten','learning':'Lernen & Pädagogik','design':'Marke & Bedienung','customers':'Kunden & Rückmeldungen','strategy':'Firma & Finanzierung','governance':'Recht, Datenschutz & Sicherheit','operations':'Technik & Betrieb','central':'Firmenzentrale'}

class LocalCoordinator:
 def __init__(self,intake,service):self.intake=intake;self.service=service
 def request_id(self,job,stage):return str(uuid.uuid5(uuid.UUID(job['id']),stage))
 def route_prompt(self,job):
  tasks=[{k:t.get(k) for k in ['id','title','domainId','topicId','scope']} for t in self.service.operations.items()]
  return 'Du bist ausschließlich die Koordination der Firmenzentrale. Ordne dieses Anliegen einem Fachbereich zu; bearbeite es nicht selbst. Bestehende Fachchats sind Quellen, keine hier ausgeführten Desktopchats. Bei entscheidender Mehrdeutigkeit central_question verwenden. Sonst mit central_report ausschließlich ein JSON-Objekt ohne Markdown speichern: domainId, topicId (kurzer Kleinbuchstaben-Slug), title, brief, reason, workItemId (passende vorhandene ID oder null). Keine Rechte, Ausführungserlaubnis oder zusätzlichen Ziele ableiten. Keine Liveänderung. Bereiche: '+json.dumps(LABELS,ensure_ascii=False)+'\nBekannte Arbeit: '+json.dumps(tasks,ensure_ascii=False)+'\nOriginalanliegen:\n'+job['text']
 def ensure_router(self,job):
  ident=job.get('routerRequestId') or self.request_id(job,'routing-v1')
  # Save binding before queue insertion. The same id recovers either side of a restart.
  if not job.get('routerRequestId'):job=self.intake.update(job,state='routing',stage='routing',routerRequestId=ident,error='')
  try:return self.service.store.get(ident)
  except KeyError:return self.service.submit({'requestId':ident,'title':'Zentrale: Anliegen zuordnen','body':self.route_prompt(job),'area':'strategy','domainId':'central','topicId':'intake-routing','conversationId':'analysis:central/intake-routing'},role='coordination')
 def validate_route(self,value):
  if not isinstance(value,dict) or set(value)!={'domainId','topicId','title','brief','reason','workItemId'}:raise ValueError('Die Zuordnung ist unvollständig.')
  if value['domainId'] not in LABELS or value['domainId'] not in self.service.operations.domains:raise ValueError('Unbekannter Fachbereich.')
  if not isinstance(value['topicId'],str) or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}',value['topicId']):raise ValueError('Unterthema nicht eindeutig.')
  for key,limit in [('title',160),('brief',4000),('reason',1000)]:
   if not isinstance(value[key],str) or not value[key].strip() or len(value[key])>limit:raise ValueError('Zuordnungstext fehlt oder ist zu lang.')
  if value['workItemId'] is not None:
   task=self.service.operations.get(value['workItemId'])
   if task['domainId']!=value['domainId'] or task['topicId']!=value['topicId']:raise ValueError('Zuordnung passt nicht zur bestehenden Aufgabe.')
  return value
 def ensure_worker(self,job,route):
  ident=job.get('workerRequestId') or self.request_id(job,'specialist-v1')
  if not job.get('workerRequestId'):job=self.intake.update(job,state='running',stage='specialist',route=route,workerRequestId=ident,domainId=route['domainId'],title=route['title'],specialistLabel=LABELS[route['domainId']],error='')
  try:return self.service.store.get(ident)
  except KeyError:
   body='Du bist die Fachbearbeitung der lokalen Firmenzentrale im Bereich '+LABELS[route['domainId']]+'. Bearbeite das Originalanliegen im vorhandenen Analyse-/Konzept-/Berichtsprofil. Prüfe passende Projektquellen und vorhandene Fachchatmeldungen. Keine Produktdatei-, Live- oder Fremdchatänderungen. Falls Umsetzung außerhalb dieses Profils nötig ist, liefere konkret verwertbare Arbeitsvorbereitung und benenne die offene Ausführung, statt Umsetzung zu behaupten. Rückfragen ausschließlich über central_question. Ergebnis mit central_report sichern. Kennzeichne Quellenstand, echte Belege, Unsicherheit und genau nächsten Schritt.\n\nOriginalanliegen:\n'+job['text']+'\n\nBereits beantwortete Rückfragen (nicht erneut fragen): '+json.dumps(job.get('clarifications',[]),ensure_ascii=False)+'\nZuordnungsbegründung (keine neue Erlaubnis): '+route['reason']+'\nArbeitsumfang: '+route['brief']
   payload={'requestId':ident,'title':route['title'],'body':body,'area':route['domainId'],'domainId':route['domainId'],'topicId':route['topicId'],'conversationId':'analysis:'+route['domainId']+'/'+route['topicId']}
   if route['workItemId']:payload['workItemId']=route['workItemId']
   return self.service.submit(payload,role='specialist',user_intent=job['text'])
 def tick(self):
  for job in reversed(self.intake.items()):
   if job['state'] in ['answered','needs_attention','unknown']:continue
   if not self.service.ready:
    self.intake.update(job,state='waiting_connection',error='Die bestehende Codex-Anmeldung ist gerade nicht erreichbar. Das Anliegen bleibt gespeichert.');return
   try:
    if job.get('stage')=='specialist':r=self.ensure_worker(job,job['route'])
    else:r=self.ensure_router(job)
    job=self.intake.get(job['id'])
    if r['status']=='waiting_user':
     self.intake.update(job,state='waiting_user',question=r['question'],questionRequestId=r['id'],error='');return
    if r['status'] in ['unknown','failed','interrupted','cancelled']:
     self.intake.update(job,state='unknown' if r['status']=='unknown' else 'needs_attention',error=r.get('error') or 'Die Fachbearbeitung benötigt einen Abgleich. Kein automatischer Neustart.');return
    if r['status']!='completed':
     self.intake.update(job,state='routing' if job['stage']=='routing' else 'running',question=None,progress=(r.get('result') or '')[-3000:]);return
    if job['stage']=='routing':
     raw=(r.get('report') or {}).get('text') or r.get('result','')
     route=self.validate_route(json.loads(raw));self.ensure_worker(job,route)
    else:
     result=r.get('result') or (r.get('report') or {}).get('text','')
     if not result:raise ValueError('Fachlauf beendet, aber kein Ergebnis vorhanden.')
     self.intake.update(job,state='answered',result=result[:64000],report=(r.get('report') or {}).get('text','')[:64000],resultThreadId=r.get('threadId'),resultTurnId=r.get('turnId'),question=None,error='',usage=r.get('usage'),model=r.get('model'))
   except Exception as e:self.intake.update(job,state='needs_attention',error='Die Zuordnung oder Bearbeitung muss geklärt werden: '+str(e)[:400])
   return
 def answer(self,payload):
  if not isinstance(payload,dict) or set(payload)!={'id','questionId','answer'}:raise ValueError('Antwort ist nicht eindeutig zugeordnet.')
  job=self.intake.get(payload['id']);q=job.get('question') or {}
  if job['state']!='waiting_user' or q.get('callId')!=payload['questionId']:raise ValueError('Diese Rückfrage ist nicht mehr aktuell. Bitte den Vorgang neu laden.')
  answer=payload['answer']
  if not isinstance(answer,str) or not answer.strip() or len(answer)>4000:raise ValueError('Bitte eine kurze Antwort eingeben.')
  self.service.answer(job['questionRequestId'],answer.strip(),q['callId'])
  return self.intake.update(job,state='routing' if job['stage']=='routing' else 'running',question=None,error='',clarifications=job.get('clarifications',[])+[{'question':q['text'],'answer':answer.strip(),'requestId':job['questionRequestId'],'callId':q['callId']}])
