import unittest,json
from didactic import validate_decision,parse_decision,check_task_demand,DecisionError,planning_prompt
class DecisionsTest(unittest.TestCase):
 def setUp(self):self.context={'kind':'answer','task':{'skill':'add','difficulty':1},'observation':{'correct':True,'hinted':False},'history':[]}
 def test_correct_response_requires_harder_probe(self):
  p={'action':'challenge','skill':'add','difficulty':2,'focus':'none','reason':'Beide Brüche erweitern.'}
  self.assertEqual(parse_decision(json.dumps(p),self.context),p)
  with self.assertRaises(DecisionError):validate_decision({**p,'action':'support','focus':'whole'},self.context)
 def test_componentwise_candidate_cannot_skip_part_size(self):
  c={**self.context,'task':{'skill':'add','difficulty':2,'a':[5,12],'b':[7,8]},'observation':{'correct':False,'hinted':False,'answer':'12/20'}}
  with self.assertRaises(DecisionError):validate_decision({'action':'support','skill':'same','difficulty':0,'focus':'sum','reason':'Zähle die Teile.'},c)
 def test_no_non_ai_fallback_for_prose(self):
  with self.assertRaises(DecisionError):parse_decision('Übe einfach Brüche.',self.context)
 def test_actual_generated_demand_is_checked(self):
  check_task_demand('add',[1,4],[1,5],2)
  with self.assertRaises(DecisionError):check_task_demand('add',[1,4],[1,8],2)
  with self.assertRaises(DecisionError):check_task_demand('add',[1,4],[1,5],3)
  with self.assertRaises(DecisionError):check_task_demand('add',[5,12],[7,8],2)
 def test_planning_prompt_preserves_context_within_existing_service_limit(self):
  s=planning_prompt(self.context,[]);self.assertIn('"correct":true',s);self.assertLessEqual(len(s),2450)
if __name__=='__main__':unittest.main()

class PlanHandlerTest(unittest.TestCase):
 def run_plan(self,reply):
  import server,io,tempfile,time
  from pathlib import Path
  from email.message import Message
  from unittest.mock import patch
  context={'kind':'answer','task':{'skill':'add','difficulty':1},'observation':{'correct':True,'hinted':False},'history':[]}
  body=json.dumps({'purpose':'plan','text':'Nächster Lernschritt','context':context}).encode();h=server.Handler.__new__(server.Handler);h.path='/api/crew';h.rfile=io.BytesIO(body);headers=Message()
  for k,v in {'Host':'127.0.0.1:8769','Origin':server.ORIGIN,'Content-Type':'application/json','Content-Length':str(len(body)),'Cookie':'gc_prototype=test'}.items():headers[k]=v
  h.headers=headers;out=[];requests=[];h.output=lambda status,data,**kw:out.append((status,data))
  def provider(url,data,headers):requests.append((url,data));return {'result':{'reply':reply}}
  with tempfile.TemporaryDirectory() as d,patch.object(server,'USAGE',Path(d)/'usage.json'),patch.object(server,'STATE',{'calls':0,'session':'test','idToken':'fake','expires':time.time()+100}),patch.object(server,'request_json',provider):h.do_POST()
  return out[0],requests
 def test_plan_context_reaches_live_handler_provider_boundary(self):
  raw={'action':'challenge','skill':'add','difficulty':2,'focus':'none','reason':'Beide Brüche erweitern.'};out,req=self.run_plan(json.dumps(raw));self.assertEqual(out[0],200);self.assertEqual(json.loads(out[1]['reply']),raw);self.assertIn('crewAssistant',req[0][0]);self.assertIn('"correct":true',req[0][1]['data']['text'])
 def test_unsuitable_response_has_no_hidden_rule_based_plan(self):
  out,_=self.run_plan('Probiere noch eine Aufgabe.');self.assertEqual(out[0],502);self.assertNotIn('reply',out[1])

class ProgressionRegressionTest(unittest.TestCase):
 def test_repeated_errors_require_a_lower_demand(self):
  c={'kind':'answer','task':{'skill':'add','difficulty':2},'observation':{'correct':False},'history':[{'skill':'add','correct':False},{'skill':'add','correct':False}]}
  p={'action':'support','skill':'add','difficulty':2,'focus':'factor','reason':'Noch einmal.'}
  with self.assertRaises(DecisionError):validate_decision(p,c)
 def test_successful_help_returns_to_easier_independent_probe(self):
  c={'kind':'guided_complete','task':{'skill':'add','difficulty':2},'observation':{'correct':True,'hinted':True},'history':[]}
  with self.assertRaises(DecisionError):validate_decision({'action':'probe','skill':'add','difficulty':2,'focus':'none','reason':'Wieder dasselbe.'},c)
 def test_reduced_inputs_cannot_undermine_difficulty(self):
  with self.assertRaises(DecisionError):check_task_demand('add',[1,8],[3,12],2)
