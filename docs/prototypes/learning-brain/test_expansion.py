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
   return json.dumps({'approved':True,'reason':'Stimmt.'})
  def generate(plan):
   calls.append('generator');return {'text':'2/3 = ?/6','numericAnswer':4}
  first=expansion.execute(data,ai,generate)
  self.assertEqual(expansion.cached(data),first)
  self.assertEqual(expansion.execute(data,ai,generate),first)
  self.assertEqual(len(calls),2)
 def test_helpful_response_after_free_question_stays_supported(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'question')
  p=expansion.plan_turn(p['state'],'answer',{'n':'4','d':'6'})
  self.assertEqual(len(p['state']['independent']),0)
  self.assertEqual(p['state']['level'],0)

class ExpansionRepeatTest(unittest.TestCase):
 def test_task_shown_with_help_is_excluded_from_next_independent_probe(self):
  import json
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':3,'k':2}),'help')
  p=expansion.plan_turn(p['state'],'answer','2')
  p=expansion.plan_turn(p['state'],'answer','4')
  p=expansion.plan_turn(p['state'],'answer',{'n':'4','d':'6'})
  draft={'task':{'n':2,'d':3,'k':2},'text':'Versuche nun eine neue Aufgabe ohne Hilfe.','question':'Welcher Bruch entsteht mit Faktor2?','solution':[4,6],'visual':'none'}
  with self.assertRaises(expansion.ExpansionError):expansion.parse_draft(json.dumps(draft),p)

class ExpansionGeneratorTest(unittest.TestCase):
 def test_existing_task_generator_is_mapped_with_exact_answer_check(self):
  self.assertTrue(callable(getattr(expansion,'generator_draft',None)),'Der vorhandene Aufgabengenerator muss angebunden werden.')
  p=expansion.plan_turn(expansion.new_state(None),'start')
  d=expansion.generator_draft({'text':'Ergänze: 2/3 = ?/6','numericAnswer':4},p)
  self.assertEqual(d['task'],{'n':2,'d':3,'k':2})
  self.assertEqual(d['solution'],[4,6])
  self.assertIn('2/3',d['question'])
  self.assertIn('mit2',d['question'].replace(' ',''))
  with self.assertRaises(expansion.ExpansionError):expansion.generator_draft({'text':'Ergänze: 2/3 = ?/6','numericAnswer':5},p)

class ExpansionDialogueTest(unittest.TestCase):
 def test_singleton_numeric_answer_is_normalized_without_changing_its_value(self):
  import json
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':7,'k':3},1),'answer',{'n':'6','d':'10'})
  p=expansion.plan_turn(p['state'],'answer','10')
  d={'task':p['state']['task'],'text':'Zwei alte Stücke werden halbiert. Zähle alle kleinen Stücke.','question':'Wie viele kleine Teile gibt es insgesamt?','solution':[4],'visual':'groups'}
  self.assertEqual(expansion.parse_draft(json.dumps(d),p)['solution'],4)
 def test_denominator_number_is_not_described_as_a_piece_to_divide(self):
  import json
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':7,'k':3},1),'answer',{'n':'6','d':'10'})
  d={'task':p['state']['task'],'text':'Jedes der sieben Teile wird in drei gleich große Teile geteilt.','question':'Wie viele Teile gibt es, wenn du den Nenner 7 in 3 gleich große Teile teilst?','solution':21,'visual':'none'}
  with self.assertRaises(expansion.ExpansionError):expansion.parse_draft(json.dumps(d),p)

class ExpansionQuestionBudgetTest(unittest.TestCase):
 def test_visible_maximum_question_fits_existing_ai_contract(self):
  p=expansion.plan_turn(expansion.new_state({'n':2,'d':7,'k':3},1),'answer',{'n':'6','d':'10'})
  self.assertLessEqual(len(expansion.generation_prompt(p,'Warum '*30)),2450)

class ExpansionActiveExampleTest(unittest.TestCase):
 def test_small_bridge_is_distinct_from_visible_original_task(self):
  p=expansion.plan_turn(expansion.new_state({'n':3,'d':4,'k':2}),'answer',{'n':'6','d':'6'})
  p=expansion.plan_turn(p['state'],'answer','6')
  f=expansion.facts(p)
  self.assertEqual(f.get('activeExample'),{'n':1,'d':2,'k':2})
  self.assertEqual(f.get('originalTask'),{'n':3,'d':4,'k':2})
  self.assertEqual(f['expected'],4)
 def test_maximum_question_after_larger_faulty_numbers_fits(self):
  p=expansion.plan_turn(expansion.new_state({'n':4,'d':8,'k':4},2),'answer',{'n':'16','d':'999','k':'999'})
  p=expansion.plan_turn(p['state'],'question')
  self.assertLessEqual(len(expansion.generation_prompt(p,'x'*180)),2450)

class ExpansionReviewFormatTest(unittest.TestCase):
 def setUp(self):
  expansion.SESSIONS.clear();expansion.RESPONSES.clear()
 def run_start(self,replies):
  self.prompts=[]
  def ai(prompt):
   self.prompts.append(prompt);return replies.pop(0)
  return expansion.execute({'action':'start','requestId':'format-test-start'},ai,lambda p:{'text':'2/3 = ?/6','numericAnswer':4})
 def test_prose_review_is_repaired_by_ai_before_display(self):
  result=self.run_start(['Die Aufgabe ist fachlich richtig.','{"approved":true,"reason":"Korrekt geprüft."}'])
  self.assertTrue(result['aiReviewed']);self.assertEqual(len(self.prompts),2)
  self.assertIn('Format',self.prompts[1]);self.assertIn('Die Aufgabe ist fachlich richtig.',self.prompts[1])
  self.assertTrue(all(len(p)<=2450 for p in self.prompts))
 def test_explicit_rejection_is_never_retried_into_approval(self):
  from lesson import LessonError
  with self.assertRaises(LessonError):self.run_start(['{"approved":false,"reason":"Frage unpassend."}'])
  self.assertEqual(len(self.prompts),1);self.assertFalse(expansion.SESSIONS)
 def test_repaired_negative_verdict_stays_rejected(self):
  from lesson import LessonError
  with self.assertRaises(LessonError):self.run_start(['Fachlich nicht passend.','{"approved":false,"reason":"Falscher Faktor."}'])
  self.assertEqual(len(self.prompts),2);self.assertFalse(expansion.SESSIONS)
 def test_repeated_malformed_review_is_bounded_and_preserves_state(self):
  with self.assertRaisesRegex(expansion.ExpansionError,'Eingabe'):
   self.run_start(['Bitte anders formulieren.','Immer noch nur Text.'])
  self.assertEqual(len(self.prompts),2);self.assertFalse(expansion.SESSIONS);self.assertFalse(expansion.RESPONSES)
 def test_rejection_without_reason_is_still_final(self):
  from lesson import LessonError
  for reply in ['{"approved":false}','{"approved":false,"reason":null}']:
   with self.subTest(reply=reply):
    with self.assertRaises(LessonError):self.run_start([reply,'{"approved":true,"reason":"Darf nicht angefragt werden."}'])
    self.assertEqual(len(self.prompts),1);self.assertFalse(expansion.SESSIONS)
