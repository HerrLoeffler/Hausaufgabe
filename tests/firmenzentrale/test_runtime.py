import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
from central_runtime.store import Store

class StoreTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name));self.p={'requestId':'11111111-1111-4111-8111-111111111111','title':'Analyse','body':'Pruefe den Stand','area':'central'}
 def tearDown(self): self.s.close();self.tmp.cleanup()
 def test_idempotent_after_restart(self):
  a=self.s.create(self.p,{'revision':'a'});self.s.close();self.s=Store(Path(self.tmp.name));b=self.s.create(self.p,{'revision':'b'});self.assertEqual(a,b);self.assertEqual(len(self.s.list()),1)
 def test_changed_duplicate_rejected(self):
  self.s.create(self.p,{});
  with self.assertRaises(ValueError):self.s.create(dict(self.p,title='anders'),{})
 def test_invalid_request(self):
  for change in [{'title':' '},{'requestId':'../../escape'},{'body':'x'*12001}]:
   with self.assertRaises(ValueError): self.s.create(dict(self.p,**change),{})
 def test_durable_events_and_result(self):
  a=self.s.create(self.p,{});self.s.update(a['id'],status='completed',result='Ergebnis');self.assertEqual(self.s.get(a['id'])['result'],'Ergebnis');self.assertTrue(self.s.events(a['id']))


from central_runtime.service import Service
from central_runtime.sources import Sources
class FakeRPC:
 def __init__(self):self.sent=[]
 def respond(self,ident,result):self.sent.append((ident,result))
 def send(self,result):self.sent.append(result)

class BoundToolTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();root=Path(__file__).resolve().parents[2];self.s=Service(root,Path(self.tmp.name),start=False);self.s.rpc=FakeRPC()
  self.p={'requestId':'22222222-2222-4222-8222-222222222222','title':'Bericht','body':'Diagnose','area':'central'}
  r=self.s.store.create(self.p,{'evidence':'nur gebundene Daten'});self.s.store.update(r['id'],threadId='thread',turnId='turn',status='running');self.ident=r['id']
 def tearDown(self):self.s.store.close();self.tmp.cleanup()
 def call(self,tool,args,turn='turn'):
  self.s.server_request({'id':9,'method':'item/tool/call','params':{'threadId':'thread','turnId':turn,'callId':'call','tool':tool,'arguments':args}})
 def test_unknown_tool_and_wrong_turn_denied(self):
  self.call('exec_command',{'cmd':'anything'});self.assertFalse(self.s.rpc.sent[-1][1]['success'])
  self.call('central_report',{'text':'bad'},'other');self.assertFalse(self.s.rpc.sent[-1][1]['success']);self.assertIsNone(self.s.store.get(self.ident)['report'])
 def test_report_is_scoped_and_hash_verified(self):
  self.call('central_report',{'text':'Bericht <script>text only</script>','path':'../../escape'})
  r=self.s.store.get(self.ident);self.assertTrue(r['report']);self.assertEqual((Path(self.tmp.name)/'reports'/f'{self.ident}.md').read_text(),r['report']['text'])
 def test_question_answer_is_same_call_and_once(self):
  self.call('central_question',{'question':'Pruefwort?'});self.assertEqual(self.s.store.get(self.ident)['status'],'waiting_user')
  with self.assertRaises(ValueError):self.s.answer(self.ident,'OK','wrong')
  self.s.answer(self.ident,'OK','call');self.assertEqual(self.s.rpc.sent[-1][0],9)
  with self.assertRaises(ValueError):self.s.answer(self.ident,'OK','call')
 def test_native_permission_is_denied(self):
  self.s.server_request({'id':8,'method':'item/commandExecution/requestApproval','params':{'threadId':'thread','turnId':'turn'}})
  self.assertEqual(self.s.rpc.sent[-1],(8,{'decision':'decline'}))
 def test_unknown_start_stays_blocked_not_requeued(self):
  self.s.store.update(self.ident,turnId=None,status='starting',attempts=1);self.s.reconcile();r=self.s.store.get(self.ident);self.assertEqual(r['status'],'unknown');self.assertEqual(r['attempts'],1)
 def test_refresh_failure_retains_last_good_source(self):
  self.s.store.set_source('github',{'lastSuccess':'yesterday','data':{'commit':'abc'}})
  self.s.sources.chats=lambda: {'count':0}
  def fail():raise RuntimeError('offline')
  self.s.sources.github=fail;self.s.sources.refresh()
  self.s.sources.lock.acquire(timeout=2);self.s.sources.lock.release()
  r=self.s.store.source('github');self.assertEqual(r['data']['commit'],'abc');self.assertEqual(r['lastSuccess'],'yesterday');self.assertEqual(r['error'],'offline')

class KnowledgeTests(unittest.TestCase):
 def test_search_is_bound_to_snapshot_revisions(self):
  with tempfile.TemporaryDirectory() as tmp:
   s=Store(Path(tmp));s.index_messages('old','thread','GradeCrew',[('a','Classroom blockiert')]);s.index_messages('new','thread','GradeCrew',[('a','Classroom behoben')]);s.index_messages('private','other','Privat',[('b','Classroom privat')])
   result=s.search_knowledge('Classroom',['old']);self.assertEqual(len(result),1);self.assertIn('blockiert',result[0]['excerpt']);self.assertNotIn('behoben',result[0]['excerpt']);s.close()

from serve_firmenzentrale import Handler
from email.message import Message
class HTTPBoundaryTests(unittest.TestCase):
 def handler(self,host='127.0.0.1:8796',origin=None,token=None):
  from types import SimpleNamespace
  h=object.__new__(Handler);h.server=SimpleNamespace(server_port=8796,token='secret');h.headers=Message();h.headers['Host']=host
  if origin:h.headers['Origin']=origin
  if token:h.headers['X-Central-Token']=token
  return h
 def test_foreign_origin_host_and_missing_token_rejected(self):
  self.assertFalse(self.handler(host='evil.test').allowed());self.assertFalse(self.handler(origin='https://evil.test',token='secret').allowed(True));self.assertFalse(self.handler(origin='http://127.0.0.1:8796').allowed(True));self.assertTrue(self.handler(origin='http://127.0.0.1:8796',token='secret').allowed(True))
 def test_private_files_never_served(self):
  h=self.handler()
  for path in ['/../../tools/central_runtime/store.py','/%2e%2e/%2e%2e/central.sqlite','/assets/gradecrew/../../../../START_HERE.md','/api/../central.sqlite']:
   self.assertTrue(h.translate_path(path).endswith('__not_found__'))

class ModelChoiceTests(unittest.TestCase):
 def test_bounded_model_selection_without_fallback(self):
  from central_runtime.service import choose_model
  self.assertEqual(choose_model({'title':'Kurzbericht','body':'Pruefe diese Angabe'}),'gpt-6-luna')
  self.assertEqual(choose_model({'title':'Standpunkt null','body':'Alle Firmenbereiche einordnen'}),'gpt-6.1-sol')

class CloudFailureTests(unittest.TestCase):
 def test_bad_cloud_import_does_not_block_other_sources(self):
  with tempfile.TemporaryDirectory() as tmp:
   store=Store(Path(tmp));sources=Sources(store,None,Path(__file__).resolve().parents[2]);(Path(tmp)/'cloud-import.json').write_text('{broken')
   sources.chats=lambda:{'count':1};sources.github=lambda:{'commit':'ok'};sources.refresh();sources.lock.acquire(timeout=2);sources.lock.release()
   self.assertIsNotNone(store.source('cloud')['error']);self.assertEqual(store.source('github')['data']['commit'],'ok');store.close()

if __name__=='__main__':unittest.main()
