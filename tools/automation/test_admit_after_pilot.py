import unittest
from tools.automation.admit_after_pilot import derive_task
from tools.automation.pipeline import digest, WEB

A, B = 'a' * 40, 'b' * 40
TASK = {'id': 'homepage-ui', 'base_sha': A, 'base_branch': WEB, 'risk': 'web-ui', 'goal': 'Polish homepage',
        'acceptance': 'Responsive CSS with reachable actions', 'constraints': 'Only CSS',
        'allowed_files': ['homepage.css'], 'context_files': ['entry.js'], 'validation_profile': 'web-combined-v1',
        'cost_profile': 'module-web-v1', 'max_cost_usd': 2.55}
BLOBS = {'homepage.css': 'c' * 40, 'entry.js': 'd' * 40}
REQUEST = {'id': 'homepage-after-pilot', 'taskId': TASK['id'], 'taskHash': digest(TASK),
           'prerequisiteTaskId': 'pilot-ui', 'originalSource': A, 'selectedBlobs': BLOBS}
PILOT = {'taskId': 'pilot-ui', 'state': 'staging_deployed', 'integratedSha': B, 'approvedSha': A}


class AdmissionAfterPilotTests(unittest.TestCase):
    def test_only_verified_pilot_commit_and_unchanged_sources_can_repin(self):
        updated = derive_task(REQUEST, TASK, PILOT, B, BLOBS)
        self.assertEqual(updated, TASK | {'base_sha': B})
        self.assertEqual(updated['max_cost_usd'], 2.55)
        for pilot in [PILOT | {'state': 'integrated'}, PILOT | {'integratedSha': A}, PILOT | {'taskId': 'other'}, PILOT | {'approvedSha': B}]:
            with self.subTest(pilot=pilot), self.assertRaises(ValueError):
                derive_task(REQUEST, TASK, pilot, B, BLOBS)
        with self.assertRaises(ValueError): derive_task(REQUEST, TASK, PILOT, A, BLOBS)

    def test_changed_task_context_or_source_never_uses_automatic_repin(self):
        for task in [TASK | {'goal': 'Changed'}, TASK | {'allowed_files': ['other.css']}, TASK | {'base_sha': B}]:
            with self.subTest(task=task), self.assertRaises(ValueError): derive_task(REQUEST, task, PILOT, B, BLOBS)
        for blobs in [BLOBS | {'homepage.css': 'e' * 40}, {'homepage.css': BLOBS['homepage.css']}, BLOBS | {'other.js': A}]:
            with self.subTest(blobs=blobs), self.assertRaises(ValueError): derive_task(REQUEST, TASK, PILOT, B, blobs)


if __name__ == '__main__': unittest.main()
