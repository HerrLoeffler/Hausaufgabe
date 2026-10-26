import sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from central_runtime.store import Store
from central_runtime.operations import Operations

class ReminderTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name));self.at='2026-11-10T12:00:00+00:00';self.o=Operations(self.s,Path(__file__).resolve().parents[2],start=False,clock=lambda:self.at,reminders=True)
  self.t=next(x for x in self.o.items() if x['priority']==2)
  with self.s.lock,self.s.db:self.t=self.o.save(dict(self.t,createdAt='2026-11-01T12:00:00+00:00'),'fixture',{})
 def tearDown(self):self.s.close();self.tmp.cleanup()
 def task(self):return self.o.get(self.t['id'])
 def test_default_has_no_automatic_deadline_or_notifications(self):
  disabled=Operations(self.s,Path(__file__).resolve().parents[2],start=False,clock=lambda:self.at);disabled.tick();self.assertFalse(self.task().get('reminder'))
  with self.assertRaises(ValueError):disabled.review_action({'id':self.t['id'],'revision':self.t['revision'],'action':'continue'})
 def test_overdue_state_is_deduplicated_and_survives_reopen(self):
  self.o.tick();a=self.task();count=len(self.s.events('work/'+a['id']));self.o.tick();self.assertEqual(len(self.s.events('work/'+a['id'])),count)
  self.assertEqual(a['reminder']['state'],'open');self.s.close();self.s=Store(Path(self.tmp.name));self.o=Operations(self.s,Path(__file__).resolve().parents[2],start=False,clock=lambda:self.at,reminders=True);self.assertEqual(self.task()['reminder'],a['reminder'])
 def test_snooze_rearms_after_expiry_and_does_not_launch_chat(self):
  self.o.tick();a=self.task();self.o.review_action({'id':a['id'],'revision':a['revision'],'action':'snooze','until':'2026-11-12T12:00:00+00:00'});self.o.tick();self.assertFalse(self.task()['reminder'])
  self.at='2026-11-13T12:00:00+00:00';self.o.tick();self.assertEqual(self.task()['reminder']['state'],'open');self.assertEqual(self.task()['delivery'],'assigned')
 def test_archive_is_reversible_and_does_not_change_owner_or_execution(self):
  a=self.task();self.o.review_action({'id':a['id'],'revision':a['revision'],'action':'archive','reason':'Später prüfen'});self.o.tick();a=self.task();self.assertTrue(a['archived']);self.assertEqual(a['delivery'],'assigned');self.assertFalse(a['reminder'])
  self.o.review_action({'id':a['id'],'revision':a['revision'],'action':'restore'});self.assertFalse(self.task()['archived']);self.assertEqual(self.task()['ownerId'],a['ownerId'])
 def test_source_poll_does_not_reset_progress_deadline(self):
  owner=self.t['ownerId'];o=self.o.owners[owner];self.o.observe(owner,{'thread':{'id':o['conversationId'],'updatedAt':1}}, {'data':[{'id':'turn','status':'completed','items':[{'id':'note','type':'agentMessage','text':'Ich schaue gleich weiter.'}]}]})
  self.o.tick();self.assertEqual(self.task()['reminder']['state'],'open');self.assertFalse(self.task().get('lastProgressAt'))
 def test_only_explicit_bound_progress_resets_deadline(self):
  owner=self.t['ownerId'];o=self.o.owners[owner];self.o.observe(owner,{'thread':{'id':o['conversationId']}},{'data':[{'id':'turn','status':'completed','items':[{'id':'note','type':'agentMessage','text':'Kandidat und Prüfergebnis gesichert.'}]}]})
  a=self.task();self.o.progress({'id':a['id'],'revision':a['revision'],'itemId':'note'});self.o.tick();self.assertFalse(self.task()['reminder']);self.assertEqual(self.task()['progressEvidence']['itemId'],'note')
  with self.assertRaises(ValueError):self.o.progress({'id':a['id'],'revision':self.task()['revision'],'itemId':'unrelated'})

if __name__=='__main__':unittest.main()
