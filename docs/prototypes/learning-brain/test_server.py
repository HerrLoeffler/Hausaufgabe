"""No network or credentials: exercise the real proxy handler with controlled GradeCrew responses."""
import io,json,tempfile,time,unittest
from pathlib import Path
from email.message import Message
from unittest.mock import patch
import server

class ProxyProfilesTest(unittest.TestCase):
 def run_task(self,skill,text,key):
  body=json.dumps({'text':'synthetic exercise','purpose':'task','skill':skill,'avoid':[]}).encode()
  handler=server.Handler.__new__(server.Handler);handler.path='/api/crew';handler.rfile=io.BytesIO(body)
  headers=Message()
  for k,v in {'Host':'127.0.0.1:8769','Origin':server.ORIGIN,'Content-Type':'application/json','Content-Length':str(len(body)),'Cookie':'gc_prototype=controlled'}.items():headers[k]=v
  handler.headers=headers;out=[];handler.output=lambda status,data,**kw:out.append((status,data));requests=[]
  def provider(url,data,headers):
   requests.append((url,data))
   return {'result':{'reply':json.dumps({'approved':True,'reason':'Passend.'})}} if 'crewAssistant' in url else {'result':{'question':{'text':text,'numericAnswer':key}}}
  with tempfile.TemporaryDirectory() as folder,patch.object(server,'USAGE',Path(folder)/'usage.json'),patch.object(server,'STATE',{'calls':0,'session':'controlled','idToken':'not-a-real-token','expires':time.time()+500}),patch.object(server,'request_json',provider):handler.do_POST()
  return out[0],requests
 def test_source_profile_reaches_actual_generator_handler(self):
  out,req=self.run_task('same','2/7 + 3/7 = ?',5/7)
  self.assertEqual(out[0],200);self.assertEqual(out[1]['profileId'],'lb-fraction-same')
  self.assertIn('crewAssistant',req[1][0]);self.assertIn('Teilgröße',req[0][1]['data']['instruction']);self.assertIn('regenerateQuestion',req[0][0])
 def test_stepback_rejects_generated_task_at_wrong_level(self):
  out,_=self.run_task('same','2/3 + 1/4 = ?',11/12);self.assertEqual(out[0],502)
 def test_independent_answer_check_rejects_wrong_provider_key(self):
  out,_=self.run_task('same','2/7 + 3/7 = ?',4/7);self.assertEqual(out[0],502)
 def test_fraction_picture_task_contract(self):
  out,_=self.run_task('parts','Lies den Anteil 3/8 ab.',3/8)
  self.assertEqual(out[0],200);self.assertEqual(json.loads(out[1]['reply'])['a'],[3,8])
if __name__=='__main__':unittest.main()

class ExpansionHandlerTest(unittest.TestCase):
 def test_real_expansion_route_uses_ai_generation_and_review(self):
  payload={'text':'Erweitern','purpose':'expansion','action':'start','requestId':'handler-test-001'}
  body=json.dumps(payload).encode();h=server.Handler.__new__(server.Handler);h.path='/api/crew';h.rfile=io.BytesIO(body);h.headers=Message()
  for k,v in {'Host':'127.0.0.1:8769','Origin':server.ORIGIN,'Content-Type':'application/json','Content-Length':str(len(body)),'Cookie':'gc_prototype=controlled'}.items():h.headers[k]=v
  out=[];h.output=lambda status,data,**kw:out.append((status,data));req=[]
  def provider(url,data,headers):
   req.append(data)
   draft={'task':{'n':2,'d':3,'k':2},'text':'Probiere zuerst selbst, beide Zahlen zu erweitern.','question':'Welcher Bruch entsteht beim Erweitern mit2?','solution':[4,6],'visual':'none'}
   return {'result':{'question':{'text':'2/3 = ?/6','numericAnswer':4}}} if 'regenerateQuestion' in url else {'result':{'reply':json.dumps({'approved':True,'reason':'Stimmt.'})}}
  with tempfile.TemporaryDirectory() as folder,patch.object(server,'USAGE',Path(folder)/'usage.json'),patch.object(server,'STATE',{'calls':80,'session':'controlled','idToken':'not-a-real-token','expires':time.time()+500}),patch.object(server,'request_json',provider):h.do_POST()
  self.assertEqual(out[0][0],200)
  self.assertEqual(out[0][1].get('target'),'practice')
  self.assertEqual(len(req),2)
  self.assertNotIn('solution',out[0][1])
  self.assertIn('Gleichwertigkeit',req[0]['data']['instruction'])
