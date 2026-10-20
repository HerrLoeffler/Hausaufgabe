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

class PromptCapacityTest(unittest.TestCase):
 def test_actual_micro_question_fits_with_history_and_material(self):
  import server
  c={'kind':'guided_complete','task':{'skill':'add','difficulty':3,'a':[3,4],'b':[7,10],'answer':[29,20]},'observation':{'correct':False,'hinted':True,'answer':'2','step':{'id':'expand-first','question':'Unten: 4 × welche Zahl = 20? Diese Zahl brauchst du auch oben.','expected':5}},'history':[{'skill':'add','difficulty':2,'correct':False,'hinted':False,'answer':'10/14'}]*4,'evidence':{'total':4,'correct':2,'supported':0,'criterion':False},'masteryClaim':False}
  self.assertLessEqual(len(planning_prompt(c,server.PROFILES['profiles'])),2450)

class RealStepbackTest(unittest.TestCase):
 def test_failed_partition_cannot_repeat_same_partition_under_lower_label(self):
  c={'kind':'guided_complete','task':{'skill':'add','difficulty':1},'observation':{'correct':False,'hinted':True,'answer':'4','step':{'id':'partition-first','question':'4 mal welche Zahl ergibt8?','expected':2}},'history':[]}
  with self.assertRaises(DecisionError):validate_decision({'action':'support','skill':'equivalent','difficulty':0,'focus':'equivalence','reason':'Noch einmal gleich.'},c)
  self.assertEqual(validate_decision({'action':'support','skill':'parts','difficulty':0,'focus':'whole','reason':'Zuerst ein farbiges Teil erkennen.'},c)['focus'],'whole')

class AnswerabilityTest(unittest.TestCase):
 def test_plan_reason_cannot_ask_an_ungraded_extra_question(self):
  c={'kind':'answer','task':{'skill':'add','difficulty':1},'observation':{'correct':True,'hinted':False},'history':[]}
  with self.assertRaises(DecisionError):validate_decision({'action':'challenge','skill':'add','difficulty':2,'focus':'none','reason':'Wie viele Teile ergeben ein Ganzes?'},c)

class HelpPrerequisiteTest(unittest.TestCase):
 def test_help_cannot_skip_expansion_to_an_unexplained_sum(self):
  c={'kind':'help_requested','task':{'skill':'add','difficulty':1,'a':[3,8],'b':[1,4]},'observation':None,'history':[]}
  with self.assertRaises(DecisionError):validate_decision({'action':'support','skill':'add','difficulty':0,'focus':'sum','reason':'Nur zusammenzählen.'},c)
