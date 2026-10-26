import sys,tempfile,unittest,importlib.util,uuid
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from central_runtime.store import Store

ROOT=Path(__file__).resolve().parents[2]
COORDINATOR='01a10df6-736b-7a62-bd38-2724cf254c2e'
class IntakeTests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name))
 def tearDown(self):self.store.close();self.tmp.cleanup()
 def intake(self,host=None,reader=None):
  self.assertIsNotNone(importlib.util.find_spec('central_runtime.intake'),'Central intake is missing')
  from central_runtime.intake import Intake
  return Intake(self.store,host=host,reader=reader)
 def request(self):return {'id':str(uuid.uuid4()),'text':'Bitte den aktuellen Lehrer-App-Stand prüfen und den nächsten Schritt nennen.'}
 def test_one_input_survives_reopen_and_double_click(self):
  i=self.intake();p=self.request();first=i.submit(p);self.assertEqual(first,i.submit(p));j=self.intake();self.assertEqual(j.get(p['id'])['text'],p['text']);self.assertEqual(len(j.items()),1)
 def test_changed_duplicate_is_rejected(self):
  i=self.intake();p=self.request();i.submit(p)
  with self.assertRaises(ValueError):i.submit(dict(p,text='Ein anderer Auftrag'))
 def test_missing_transport_keeps_saved_request_waiting(self):
  i=self.intake();p=self.request();i.submit(p);i.tick();self.assertEqual(i.get(p['id'])['state'],'waiting_connection');self.assertFalse(i.get(p['id']).get('turnId'))
 def test_busy_coordinator_is_not_interrupted(self):
  class Host:
   ready=True
   def call(self,method,params,**kw):
    if method!='thread/read':raise AssertionError('No new input into busy coordinator')
    return {'thread':{'id':COORDINATOR,'status':{'type':'active'}}}
  i=self.intake(Host());p=self.request();i.submit(p);i.tick();self.assertEqual(i.get(p['id'])['state'],'waiting_coordinator')
 def test_uncertain_send_is_never_repeated_after_reopen(self):
  class Host:
   ready=True;starts=0
   def call(self,method,params,**kw):
    if method=='thread/read':return {'thread':{'id':COORDINATOR,'status':{'type':'idle'}}}
    self.starts+=1;raise TimeoutError()
  h=Host();i=self.intake(h);p=self.request();i.submit(p);i.tick();self.assertEqual(i.get(p['id'])['state'],'unknown');self.intake(h).tick();self.assertEqual(h.starts,1)
 def test_only_exact_bound_turn_returns_result(self):
  class Host:
   ready=True
   def call(self,method,params,**kw):
    if method=='thread/read':return {'thread':{'id':COORDINATOR,'status':{'type':'idle'}}}
    return {'turn':{'id':'bound-turn'}}
  class Reader:
   def call(self,method,params,**kw):
    if method=='thread/turns/list':return {'data':[{'id':'unrelated','status':'completed','items':[{'type':'agentMessage','phase':'final_answer','text':'Fremdes Ergebnis'}]},{'id':'bound-turn','status':'completed','items':[{'type':'agentMessage','phase':'final_answer','text':'Gebundenes Ergebnis'}]}]}
    if method=='thread/items/list':return {'data':[{'turnId':'unrelated','item':{'type':'agentMessage','phase':'final_answer','text':'Fremdes Ergebnis'}},{'turnId':'bound-turn','item':{'type':'agentMessage','phase':'final_answer','text':'Gebundenes Ergebnis'}}]}
  i=self.intake(Host(),Reader());p=self.request();i.submit(p);i.tick();i.tick();r=i.get(p['id']);self.assertEqual(r['state'],'answered');self.assertEqual(r['result'],'Gebundenes Ergebnis');self.assertEqual(r['coordinatorId'],COORDINATOR)
 def test_result_reader_requests_only_items_from_exact_turn(self):
  class Reader:
   calls=[]
   def call(self,method,params,**kw):
    self.calls.append((method,params))
    if method=='thread/turns/list':return {'data':[{'id':'bound','status':'completed'}]}
    return {'data':[{'turnId':'bound','item':{'type':'agentMessage','phase':'final_answer','text':'Nur dieser Vorgang'}}]}
  r=Reader();i=self.intake(reader=r);job=i.submit(self.request());i.update(job,state='running',turnId='bound');i.tick()
  self.assertEqual(i.get(job['id'])['result'],'Nur dieser Vorgang')
  self.assertEqual(r.calls[-1][1]['turnId'],'bound');self.assertNotEqual(r.calls[0][1]['itemsView'],'full')

if __name__=='__main__':unittest.main()
