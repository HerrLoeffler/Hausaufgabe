import copy
import unittest
from .candidate_revalidation import qualify

class QualificationTests(unittest.TestCase):
    def setUp(self):
        self.req = {'taskId':'startscreen-masterpiece-v4-20261004', 'requestId':'run-37229978936-1', 'originalRun':37230004552, 'originalHead':'a'*40}
        self.attempt = {'taskId':self.req['taskId'], 'requestId':self.req['requestId'], 'runId':self.req['originalRun'], 'state':'repairable', 'publication':{'head':'a'*40}, 'usage':[{'estimatedUsd':.174598}], 'estimatedUsd':.174598}
        self.reservations = [{'taskId':self.req['taskId'], 'requestId':self.req['requestId'], 'reservedUsd':2.4}]
        self.jobs = [{'name':n, 'status':'completed','conclusion':c} for n,c in [('prepare','success'),('build','success'),('publish','success'),('validate / test','failure'),('finalize','success'),('reviews','skipped'),('integrate','skipped')]]
    def test_qualifies_only_unused_reviews_under_original_reservation(self):
        old = copy.deepcopy(self.attempt)
        self.assertEqual(qualify(self.req,self.attempt,self.reservations,self.jobs),2.4)
        self.assertEqual(self.attempt,old)
    def test_duplicate_or_ambiguous_recovery_is_rejected(self):
        for field,value in [('candidateRecovery',{'state':'unknown'}),('state','stopped'),('runId',123),('usage',[{'estimatedUsd':.1},{'estimatedUsd':.1}])]:
            attempt=copy.deepcopy(self.attempt);attempt[field]=value
            with self.assertRaises(ValueError):qualify(self.req,attempt,self.reservations,self.jobs)
    def test_any_prior_review_or_running_job_blocks(self):
        for conclusion in ['success','failure',None]:
            jobs=copy.deepcopy(self.jobs);jobs[5]['conclusion']=conclusion
            with self.assertRaises(ValueError):qualify(self.req,self.attempt,self.reservations,jobs)
        jobs=copy.deepcopy(self.jobs);jobs[3]['status']='in_progress'
        with self.assertRaises(ValueError):qualify(self.req,self.attempt,self.reservations,jobs)
    def test_insufficient_or_duplicate_reservation_blocks(self):
        for reservations in [[],self.reservations*2,[{**self.reservations[0],'reservedUsd':.2}]]:
            with self.assertRaises(ValueError):qualify(self.req,self.attempt,reservations,self.jobs)

if __name__=='__main__':unittest.main()
