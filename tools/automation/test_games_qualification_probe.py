"""The rehearsal checks rejection of a known stale fixture, never its admission."""
import subprocess
import unittest

GOOD='not ok 16 - M1.4 learning success and transfer schedules cannot be queued repeatedly\n# tests 36\n# pass 35\n# fail 1\n'

class KnownBlockerTests(unittest.TestCase):
    def test_only_the_documented_rejection_can_pass_the_negative_probe(self):
        try:
            from tools.automation.games_qualification_probe import expected_blocker
        except ImportError:self.fail('Explicit negative qualification probe missing')
        receipt=expected_blocker(subprocess.CalledProcessError(1,['node','--test','fixed.test.cjs'],output=GOOD))
        self.assertEqual(receipt['qualification'],'blocked')
        self.assertFalse(receipt['automaticActivation'])
        for text in [GOOD.replace('M1.4 learning success','different learning success'),GOOD.replace('# fail 1','# fail 2'),GOOD.replace('# pass 35','# pass 34')]:
            with self.assertRaises(ValueError):expected_blocker(subprocess.CalledProcessError(1,['node','--test','fixed.test.cjs'],output=text))
        with self.assertRaises(ValueError):expected_blocker(subprocess.CalledProcessError(1,['node','--check','app.js'],output=GOOD))
