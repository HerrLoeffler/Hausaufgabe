import sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from central_runtime.service import Service
class ConversationTests(unittest.TestCase):
 def test_stable_scope_survives_restart_and_changes_conflict(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Service(Path(__file__).resolve().parents[2],Path(tmp),start=False);s.ready=True;s.sources.context=lambda *args:{}
   p={'requestId':'33333333-3333-4333-8333-333333333333','title':'Rückfrage','body':'Stand?','area':'tech','domainId':'native','topicId':'lehrer-app','conversationId':'analysis:native/lehrer-app'}
   r=s.submit(p);self.assertEqual(r.get('domainId'),'native');self.assertEqual(r.get('conversationId'),p['conversationId'])
   with self.assertRaises(ValueError):s.submit(dict(p,topicId='secure'))
   s.store.close()
 def test_followup_resumes_only_own_scoped_analysis_thread(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Service(Path(__file__).resolve().parents[2],Path(tmp),start=False);s.ready=True;s.sources.context=lambda *args:{}
   class RPC:
    calls=[]
    def call(self,method,params,**kwargs):
     self.calls.append((method,params))
     if method=='thread/resume':return {'thread':{'id':'own-analysis'}}
     if method=='turn/start':return {'turn':{'id':'next-turn'}}
     raise AssertionError('Unexpected operation '+method)
   s.rpc=RPC();s.models=[{'model':'gpt-6-luna'}]
   p={'requestId':'33333333-3333-4333-8333-333333333333','title':'Rückfrage','body':'Stand?','area':'tech','domainId':'native','topicId':'lehrer-app','conversationId':'analysis:native/lehrer-app'}
   a=s.submit(p);s.store.update(a['id'],status='completed',threadId='own-analysis',attempts=1)
   b=s.submit(dict(p,requestId='44444444-4444-4444-8444-444444444444',body='Was fehlt?'));s.start_request(b['id'])
   self.assertEqual(s.store.get(b['id'])['threadId'],'own-analysis');self.assertEqual(s.store.get(a['id'])['attempts'],1)
   self.assertEqual(s.rpc.calls[0][0],'thread/resume');s.store.close()

class EventBindingTests(unittest.TestCase):
 def test_late_old_turn_result_does_not_overwrite_followup(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Service(Path(__file__).resolve().parents[2],Path(tmp),start=False)
   first=s.store.create({'requestId':'55555555-5555-4555-8555-555555555555','title':'alt','body':'a','area':'tech'},{});s.store.update(first['id'],status='completed',threadId='t',turnId='old',result='old result')
   second=s.store.create({'requestId':'66666666-6666-4666-8666-666666666666','title':'neu','body':'b','area':'tech'},{});s.store.update(second['id'],status='running',threadId='t',turnId='new',result='new result')
   s.event({'method':'turn/completed','params':{'threadId':'t','turn':{'id':'old','status':'completed'}}})
   self.assertEqual(s.store.get(second['id'])['status'],'running');self.assertEqual(s.store.get(second['id'])['result'],'new result');s.store.close()
