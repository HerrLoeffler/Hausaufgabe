import json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from central_runtime.store import Store
from central_runtime.sources import Sources
ROOT=Path(__file__).resolve().parents[2]
class FreshnessTests(unittest.TestCase):
 def test_missing_timestamp_never_freezes_messages(self):
  with tempfile.TemporaryDirectory() as d:
   s=Store(Path(d));source=Sources(s,None,ROOT);source.inventory={'chats':[{'id':'t','title':'GC Test','kind':'codex'}]}
   class RPC:
    text='alter Stand'
    def call(self,method,params,**kw):
     if method=='thread/list':return {'data':[]}
     if method=='thread/read':return {'thread':{'updatedAt':None}}
     return {'data':[{'id':'turn','items':[{'id':'message','type':'agentMessage','text':self.text}]}]}
   source.rpc=RPC();a=source.chats();s.set_source('codex',{'data':a});source.rpc.text='neuer Stand';b=source.chats()
   self.assertNotEqual(a['chats'][0]['revision'],b['chats'][0]['revision'])
   self.assertIn('neuer Stand',s.search_knowledge('Stand',[b['chats'][0]['revision']])[0]['excerpt']);s.close()
from central_runtime.releases import Releases, public_manifest
class ReleaseTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name));self.r=Releases(self.s,ROOT)
  c=self.r.catalog['candidates'][0];self.p={'id':'11111111-1111-4111-8111-111111111111','candidate':c['id'],'sha':c['sourceCommit'],'environment':c['testEnvironment'],'check':'fachlich','result':'passed','reviewer':'Testperson','evidence':'Referenzfall A mit erwarteten 3 Punkten geprüft.'}
 def tearDown(self):self.s.close();self.tmp.cleanup()
 def test_journal_binding_and_idempotency(self):
  a=self.r.review(self.p);self.assertEqual(a,self.r.review(self.p));self.assertEqual(len(self.r.public()['reviews']),1)
  for patch in [{'sha':'0'*40},{'environment':'live'},{'candidate':'unknown'},{'check':'livefreigabe'},{'evidence':''},{'id':self.p['id'],'result':'failed'}]:
   with self.assertRaises(ValueError):self.r.review(dict(self.p,**patch))
 def test_history_retained(self):
  self.r.review(self.p);self.r.review(dict(self.p,id='22222222-2222-4222-8222-222222222222',result='failed'));self.assertEqual(len(self.r.public()['reviews']),2)
 def test_manifest_validation_and_minimization(self):
  m=public_manifest({'commit':'a'*40,'project':'p','version':'v','files':{'private':'omit'}},'p');self.assertNotIn('files',m)
  for value in [{'commit':'x','project':'p'},{'commit':'a'*40,'project':'other'},[]]:
   with self.assertRaises(ValueError):public_manifest(value,'p')
 def test_failed_refresh_preserves_last_success_but_marks_stale(self):
  self.r.catalog['environments']=self.r.catalog['environments'][:1]
  self.r.fetch=lambda url,project: {'commit':'a'*40,'project':project,'version':'v'}
  self.r.scan();a=self.r.public()['observations']['live']
  def fail(*args):raise ValueError('offline')
  self.r.fetch=fail;self.r.scan();b=self.r.public()['observations']['live'];self.assertEqual(a['lastSuccess'],b['lastSuccess']);self.assertEqual(b['lastGood']['commit'],'a'*40);self.assertTrue(b['error'])
