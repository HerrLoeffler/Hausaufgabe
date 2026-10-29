import sys,tempfile,unittest,uuid,json,importlib.util
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from central_runtime.store import Store
from central_runtime.intake import Intake
from central_runtime.operations import Operations
ROOT=Path(__file__).resolve().parents[2]

class RoutingTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name));self.intake=Intake(self.store);store=self.store
  class Service:
   ready=True
   def __init__(self):self.store=store;self.operations=Operations(store,ROOT,start=False)
   def submit(self,payload,role=None,user_intent=None):return self.store.create(payload,{'executionRole':role,'userIntent':user_intent})
   def answer(self,ident,answer,call_id):
    r=self.store.get(ident)
    if r['question']['callId']!=call_id:raise ValueError('Wrong question')
    self.store.update(ident,status='running',question=None)
  self.service=Service()
 def tearDown(self):self.store.close();self.tmp.cleanup()
 def engine(self):
  self.assertIsNotNone(importlib.util.find_spec('central_runtime.intake_routing'),'Own central routing is missing')
  from central_runtime.intake_routing import LocalCoordinator
  return LocalCoordinator(self.intake,self.service)
 def job(self):return self.intake.submit({'id':str(uuid.uuid4()),'text':'Bitte die nächsten Schritte beim Lernen knapp zusammenfassen.'})
 def route(self):return {'domainId':'learning','topicId':'planning','title':'Lernstand klären','brief':'Nächsten belegten Schritt aus Quellen nennen.','reason':'Pädagogischer Auftrag','workItemId':None}
 def finish_router(self,job,route=None):
  j=self.intake.get(job['id']);self.store.update(j['routerRequestId'],status='completed',report={'text':json.dumps(route or self.route())})
 def test_one_input_routes_to_one_bound_specialist_and_returns_its_result(self):
  e=self.engine();j=self.job();e.tick();self.finish_router(j);e.tick();j=self.intake.get(j['id']);self.assertEqual(j['state'],'running');self.assertNotEqual(j['workerRequestId'],j['routerRequestId']);w=self.store.get(j['workerRequestId']);self.assertEqual(w['domainId'],'learning')
  self.store.update(w['id'],status='completed',result='Nur dieses Ergebnis',threadId='own-specialist',turnId='own-turn');e.tick();j=self.intake.get(j['id']);self.assertEqual(j['result'],'Nur dieses Ergebnis');self.assertEqual(j['resultThreadId'],'own-specialist');self.assertEqual(j['state'],'answered')
 def test_restart_and_repeated_ticks_do_not_duplicate_stages(self):
  e=self.engine();j=self.job();e.tick();self.engine().tick();self.assertEqual(len(self.store.list()),1);self.finish_router(j);self.engine().tick();self.engine().tick();self.assertEqual(len(self.store.list()),2)
 def test_invalid_routing_cannot_select_arbitrary_thread_or_scope(self):
  e=self.engine();j=self.job();e.tick();r=self.route();r['domainId']='arbitrary';self.finish_router(j,r);e.tick();self.assertEqual(self.intake.get(j['id'])['state'],'needs_attention');self.assertEqual(len(self.store.list()),1)
 def test_uncertain_model_start_blocks_replay(self):
  e=self.engine();j=self.job();e.tick();j=self.intake.get(j['id']);self.store.update(j['routerRequestId'],status='unknown',attempts=1);self.engine().tick();self.engine().tick();self.assertEqual(len(self.store.list()),1);self.assertEqual(self.intake.get(j['id'])['state'],'unknown')
 def test_question_and_answer_keep_exact_request_and_call_binding(self):
  e=self.engine();j=self.job();e.tick();j=self.intake.get(j['id']);self.store.update(j['routerRequestId'],status='waiting_user',question={'text':'Welcher Bereich?','callId':'exact-question'});e.tick();self.assertEqual(self.intake.get(j['id'])['question']['text'],'Welcher Bereich?')
  with self.assertRaises(ValueError):e.answer({'id':j['id'],'questionId':'wrong','answer':'Lernen'})
  e.answer({'id':j['id'],'questionId':'exact-question','answer':'Lernen'});self.assertEqual(len(self.store.list()),1);self.assertEqual(self.store.get(j['routerRequestId'])['status'],'running')
 def test_old_requests_and_attempts_are_not_changed(self):
  p={'requestId':str(uuid.uuid4()),'title':'Bestand','body':'Erhalten','area':'tech'};r=self.store.create(p,{});self.store.update(r['id'],status='completed',attempts=1);before=self.store.get(r['id']);e=self.engine();self.job();e.tick();self.assertEqual(before,self.store.get(r['id']))
 def test_short_answer_is_separate_from_full_evidence_report(self):
  e=self.engine();j=self.job();e.tick();self.finish_router(j);e.tick();j=self.intake.get(j['id']);self.store.update(j['workerRequestId'],status='completed',result='Kurze Antwort.',report={'text':'Vollständiger Bericht mit Quellennachweisen.'});e.tick();j=self.intake.get(j['id']);self.assertEqual(j['result'],'Kurze Antwort.');self.assertEqual(j['report'],'Vollständiger Bericht mit Quellennachweisen.')
 def test_model_choice_counts_user_intent_instead_of_generated_wrapper(self):
  from central_runtime.service import choose_model
  brief={'title':'Kurze Erklärung','body':'Arbeitskontext '*1000,'context':{'executionRole':'specialist','userIntent':'Erkläre kurz einen Prüfablauf.'}}
  self.assertEqual(choose_model(brief),'gpt-6-luna');brief['context']['userIntent']='Klärung der Sicherheitsarchitektur für alle Bereiche';self.assertEqual(choose_model(brief),'gpt-6.1-sol')

if __name__=='__main__':unittest.main()
