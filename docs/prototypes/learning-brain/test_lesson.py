import unittest,json
from lesson import lesson_prompt,parse_lesson,LessonError
class LessonTest(unittest.TestCase):
 def setUp(self):
  self.ctx={'task':{'skill':'add','a':[1,4],'b':[1,5],'common':20,'answer':[9,20]},'answer':'2/9','focus':'factor','steps':[{'id':'expand-first','text':'Zähler und Nenner mit 5 multiplizieren.'},{'id':'check','text':'Jetzt probierst du einen kleinen Schritt.'}]}
 def test_provider_words_required_for_every_step(self):
  raw={'steps':[{'id':'expand-first','text':'Oben mal 5, unten mal 5: So bleibt gleich viel gefärbt.'},{'id':'check','text':'Jetzt bist du dran. Schau auf die gleich großen Teile.'}]}
  self.assertEqual(parse_lesson(json.dumps(raw),self.ctx),raw)
  with self.assertRaises(LessonError):parse_lesson(json.dumps({'steps':raw['steps'][:1]}),self.ctx)
 def test_no_wall_of_text_or_unapproved_numbers_or_markup(self):
  for text in ['Wort '*100,'Du brauchst 123 Teile.','<b>Rechne</b>']:
   with self.assertRaises(LessonError):parse_lesson(json.dumps({'steps':[{'id':s['id'],'text':text} for s in self.ctx['steps']]}),self.ctx)
 def test_prompt_requests_simple_reason_not_just_rule_and_keeps_scope(self):
  p=lesson_prompt(self.ctx);self.assertIn('wie für ein fünfjähriges Kind',p);self.assertIn('Warum',p);self.assertLessEqual(len(p),2450)

class ReviewTest(unittest.TestCase):
 def test_second_ai_pass_must_explicitly_approve(self):
  from lesson import parse_review
  self.assertTrue(parse_review('{"approved":true,"reason":"Passend"}'))
  for value in ['{"approved":false,"reason":"Falsche Rechnung"}','sieht gut aus','{}']:
   with self.assertRaises(LessonError):parse_review(value)
 def test_unanswerable_extra_question_is_rejected(self):
  ctx={'steps':[{'id':'first','text':'Vier Teile','allowedVisuals':['none']} ]}
  with self.assertRaises(LessonError):parse_lesson('{"steps":[{"id":"first","text":"Was denkst du dazu?"}]}',ctx)

class LessonHandlerTest(unittest.TestCase):
 def test_explanation_requires_second_provider_approval(self):
  import server,io,time,tempfile
  from pathlib import Path
  from email.message import Message
  from unittest.mock import patch
  for approved in [True,False]:
   ctx={'task':{'skill':'add','a':[1,4],'b':[1,5]},'focus':'factor','steps':[{'id':'expand-first','text':'Oben und unten mal5.','question':'Welche Zahl?','expected':5,'allowedVisuals':['none']}]}
   body=json.dumps({'text':'Kurz erklären','purpose':'lesson','lesson':ctx}).encode();h=server.Handler.__new__(server.Handler);h.path='/api/crew';h.rfile=io.BytesIO(body);headers=Message()
   for k,v in {'Host':'127.0.0.1:8769','Origin':server.ORIGIN,'Content-Type':'application/json','Content-Length':str(len(body)),'Cookie':'gc_prototype=test'}.items():headers[k]=v
   h.headers=headers;out=[];req=[];h.output=lambda code,data,**kw:out.append((code,data))
   def provider(url,data,headers):
    req.append(data)
    reply={'steps':[{'id':'expand-first','text':'Die Menge bleibt gleich. Wir teilen nur feiner.','visual':'none'}]} if len(req)==1 else {'approved':approved,'reason':'Kontrolle'}
    return {'result':{'reply':json.dumps(reply)}}
   with tempfile.TemporaryDirectory() as d,patch.object(server,'USAGE',Path(d)/'usage.json'),patch.object(server,'STATE',{'calls':0,'session':'test','idToken':'fake','expires':time.time()+100}),patch.object(server,'request_json',provider):h.do_POST()
   self.assertEqual(len(req),2);self.assertEqual(out[0][0],200 if approved else 502)
   if approved:self.assertTrue(out[0][1]['aiReviewed'])
   else:self.assertNotIn('reply',out[0][1])

class ReviewContextTest(unittest.TestCase):
 def test_wrong_student_attempt_is_never_called_a_solution(self):
  from lesson import lesson_review_data,review_prompt
  c={'task':{'a':[1,4],'b':[1,10],'answer':[7,20]},'answer':'2/14','steps':[]}
  data=lesson_review_data(c,{'steps':[]});self.assertNotIn('answer',data);self.assertEqual(data['studentAttempt'],'2/14');self.assertFalse(data['studentAttemptIsSolution']);self.assertIn('keine Musterlösung',review_prompt('Erklärung',data))

class StageMeaningTest(unittest.TestCase):
 def test_addition_is_not_explained_as_unchanged_total_quantity(self):
  p=lesson_prompt({'task':{'a':[1,4],'b':[1,8]},'steps':[{'id':'sum','text':'2 blaue und1 orange Teile sind3Teile.'}]})
  self.assertNotIn('Warum bleibt gleich viel gefärbt?',p)
  self.assertIn('Mengen zusammenzählen',p)
 def test_partition_explains_unchanged_quantity_with_new_cut_lines(self):
  p=lesson_prompt({'steps':[{'id':'partition-first','text':'Jedes alte Stück wird in2geteilt.'}]});self.assertIn('Schnittlinien',p)
