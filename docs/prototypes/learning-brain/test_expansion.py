import unittest
try:
 import expansion
except ImportError:
 expansion=None

class ExpansionFlowTest(unittest.TestCase):
 def test_repeated_errors_reduce_to_counting_then_one_piece(self):
  self.assertIsNotNone(expansion,'Der eigene KI-Lernweg zum Erweitern fehlt.')
  s=expansion.new_state({'n':2,'d':3,'k':2},0)
  p=expansion.plan_turn(s,'answer',{'n':'2','d':'6'})
  self.assertEqual(p['target'],'numerator')
  p=expansion.plan_turn(p['state'],'answer','8')
  self.assertEqual(p['target'],'count-blue')
  self.assertEqual(p['expected'],2)
  p=expansion.plan_turn(p['state'],'answer','8')
  self.assertEqual(p['target'],'split-one')
  self.assertEqual(p['expected'],2)
  p=expansion.plan_turn(p['state'],'answer','8')
  self.assertEqual(p['target'],'pause')

if __name__=='__main__':unittest.main()

class ExpansionEvidenceTest(unittest.TestCase):
 def test_denominator_error_checks_denominator_not_correct_numerator(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'answer',{'n':'4','d':'5'})
  self.assertEqual((p['target'],p['expected']),('denominator',6))
  self.assertEqual(expansion.plan_turn(p['state'],'answer','5')['target'],'count-total')
 def test_help_success_returns_to_original_then_new_independent_task(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'answer',{'n':'2','d':'6'})
  p=expansion.plan_turn(p['state'],'answer','4')
  self.assertEqual(p['target'],'completion')
  self.assertEqual(p['expected'],[4,6])
  p=expansion.plan_turn(p['state'],'answer',{'n':'4','d':'6'})
  self.assertTrue(p['needsTask']);self.assertEqual(p['state']['level'],0)
  self.assertEqual(sum(x['correct'] for x in p['state']['independent']),0)
  self.assertEqual(p['state']['supportedSuccesses'],1)
 def test_equivalent_value_is_distinguished_from_requested_factor(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'answer',{'n':'8','d':'12'})
  self.assertTrue(p['observation']['valueEquivalent']);self.assertFalse(p['observation']['correct'])
 def test_success_does_not_create_mastery_and_moves_to_different_demand(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'answer',{'n':'4','d':'6'})
  self.assertEqual(p['target'],'practice');self.assertEqual(p['state']['level'],1)
  self.assertEqual(len(p['state']['independent']),1)
 def test_free_question_marks_current_task_supported(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'question')
  self.assertTrue(p['state']['supported'])
 def test_prompts_fit_existing_gradecrew_contract_even_after_errors(self):
  s=expansion.new_state({'n':2,'d':3,'k':4},1)
  for answer in [{'n':'2','d':'12'},'99','99','99']:
   p=expansion.plan_turn(s,'answer',answer);s=p['state']
   self.assertLessEqual(len(expansion.generation_prompt(p)),2450)
 def test_ai_wrong_solution_or_extra_question_is_rejected(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'answer',{'n':'2','d':'6'})
  raw={'task':s['task'] if (s:=p['state']) else None,'text':'Multipliziere die markierten Teile mit2.','question':'Was ist2 mal2?','solution':5,'visual':'none'}
  with self.assertRaises(expansion.ExpansionError):expansion.parse_draft(__import__('json').dumps(raw),p)
  raw.update(solution=4,text='Was denkst du?')
  with self.assertRaises(expansion.ExpansionError):expansion.parse_draft(__import__('json').dumps(raw),p)

class ExpansionRequestTest(unittest.TestCase):
 def test_retry_reuses_result_without_another_provider_call(self):
  import json
  expansion.SESSIONS.clear()
  if hasattr(expansion,'RESPONSES'):expansion.RESPONSES.clear()
  data={'action':'start','requestId':'request-retry-001'};calls=[]
  def ai(prompt):
   calls.append(prompt)
   return json.dumps({'task':{'n':2,'d':3,'k':2},'text':'Probiere es zuerst selbst mit beiden Zahlen.','question':'Welcher Bruch entsteht mit Faktor2?','solution':[4,6],'visual':'none'} if len(calls)==1 else {'approved':True,'reason':'Stimmt.'})
  first=expansion.execute(data,ai)
  self.assertEqual(expansion.cached(data),first)
  self.assertEqual(expansion.execute(data,ai),first)
  self.assertEqual(len(calls),2)
 def test_helpful_response_after_free_question_stays_supported(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'question')
  p=expansion.plan_turn(p['state'],'answer',{'n':'4','d':'6'})
  self.assertEqual(len(p['state']['independent']),0)
  self.assertEqual(p['state']['level'],0)
