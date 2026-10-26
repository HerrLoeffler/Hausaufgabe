from pathlib import Path
import subprocess,tempfile
root=Path(__file__).parent
source=root/'Sources/GradeCrewAuthRestoreDeadline.swift'
assert source.exists(), 'Missing bounded auth restoration deadline'
checks="""
var watch=GradeCrewAuthRestoreDeadline()
let first=watch.begin(at:100)
assert(!watch.expired(first,at:119.9))
assert(watch.expired(first,at:120))
let retry=watch.begin(at:121)
assert(!watch.expired(first,at:999))
assert(!watch.expired(retry,at:140.9))
watch.finish()
assert(!watch.expired(retry,at:999))
let accountSwitch=watch.begin(at:200)
assert(watch.expired(accountSwitch,at:220))
watch.finish()
assert(!watch.expired(accountSwitch,at:230))
print("Restore deadline: bounded failure, retry invalidation, late callback, account switch passed")
"""
with tempfile.TemporaryDirectory() as work:
 p=Path(work)/'deadline.swift';p.write_text(source.read_text()+checks)
 subprocess.run(['swift','-module-cache-path',str(Path(work)/'cache'),str(p)],check=True)
