"""Run the real one-shot crew timing/layout policy with host Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
checks = r'''
let start = Date(timeIntervalSince1970: 1000)
func sample(_ seconds: Double, reduceMotion: Bool = false) -> GradeCrewBrandMotionPolicy.Sample {
    GradeCrewBrandMotionPolicy.sample(startedAt: start, now: start.addingTimeInterval(seconds), reduceMotion: reduceMotion)
}
assert(sample(1).frameIndex == 19, "The twentieth frame must be held at one second")
assert(sample(100).frameIndex == 19, "Completed animation must never loop")
assert(sample(-1).frameIndex == 0, "Before the shared start, use the first frame")
assert(sample(-1).travelProgress == 0)
assert(sample(0).frameIndex == 0)
assert(sample(0.05).frameIndex == 1, "The second frame begins exactly at 50 ms")
assert(sample(0.6).frameIndex == 12, "Reaching begins at frame thirteen")
assert(sample(0.8).frameIndex == 16, "Cuddling begins at frame seventeen")
assert(sample(0.95).frameIndex == 19)
for index in 0..<20 {
    let atFrameCenter = Double(index) * 0.05 + 0.025
    assert(sample(atFrameCenter).frameIndex == index, "Every distinct frame must be reachable")
}
assert(sample(0, reduceMotion: true).frameIndex == 19)
assert(sample(0, reduceMotion: true).travelProgress == 1)
assert(sample(-1, reduceMotion: true).frameIndex == 19)

let midFlight = sample(0.4)
assert(midFlight.travelProgress > 0 && midFlight.travelProgress < 1)
assert(sample(0.8).travelProgress == 1, "Arrival precedes the four cuddle frames")
let final = sample(1)
assert(GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: .emmi, index: sample(0.225).frameIndex), "Emmi's selected reversed run frames must face the logo")
for index in 0..<20 {
    assert(GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: .emmi, index: index) == [4, 5, 6, 7].contains(index))
    assert(GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: .wilma, index: index) == [3, 5, 7, 9].contains(index))
    assert(!GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: .coco, index: index))
    assert(!GradeCrewBrandMotionPolicy.shouldMirrorFrame(for: .remy, index: index))
}
for mascot in GradeCrewBrandMotionPolicy.Mascot.allCases {
    let arrival = final.center(for: mascot)
    let running = sample(0).center(for: mascot)
    assert(arrival.x - 37 < 187 && arrival.x + 37 > 73, "Final figures must overlap the logo's horizontal area")
    assert(arrival.y - 37 < 137 && arrival.y + 37 > 23, "Final figures must overlap the logo's vertical area")
    if mascot == .coco || mascot == .remy {
        assert(running.x < arrival.x && arrival.x < 130, "Left crew runs inward")
    } else {
        assert(running.x > arrival.x && arrival.x > 130, "Right crew runs inward")
    }
}
let authSample = GradeCrewBrandMotionPolicy.sample(startedAt: start, now: start.addingTimeInterval(0.35), reduceMotion: false)
let homeSample = GradeCrewBrandMotionPolicy.sample(startedAt: start, now: start.addingTimeInterval(0.4), reduceMotion: false)
assert(homeSample.frameIndex > authSample.frameIndex, "Auth-to-home must continue the shared clock")
assert(sample(3).frameIndex == 19, "Foreground after completion holds final pose")
let dates = GradeCrewBrandMotionPolicy.refreshDates(startedAt: start, from: start.addingTimeInterval(0.41), reduceMotion: false, isActive: true)
assert(dates.first == start.addingTimeInterval(0.41))
assert(dates.last == start.addingTimeInterval(1))
assert(dates.count == 13, "Remaining finite schedule includes current, frames 9...19 and final boundary")
assert(GradeCrewBrandMotionPolicy.refreshDates(startedAt: start, from: start.addingTimeInterval(1), reduceMotion: false, isActive: true).isEmpty)
assert(GradeCrewBrandMotionPolicy.refreshDates(startedAt: start, from: start, reduceMotion: true, isActive: true).isEmpty)
assert(GradeCrewBrandMotionPolicy.refreshDates(startedAt: start, from: start, reduceMotion: false, isActive: false).isEmpty)
print("GradeCrew brand motion: passed (20 frames, one-second hold, shared auth clock, finite schedule, Reduce Motion, overlapping arrival)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "brand-motion.swift"
    source = root / "Sources/GradeCrewBrandMotionPolicy.swift"
    script.write_text(source.read_text() + "\n" + checks)
    subprocess.run(["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)], check=True)
