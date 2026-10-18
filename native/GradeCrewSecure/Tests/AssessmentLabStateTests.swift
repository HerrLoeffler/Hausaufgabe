import XCTest
import CoreFoundation
@testable import AssessmentLabCore

final class AssessmentLabStateTests: XCTestCase {
    func testQuestionWaitsForAppleAndCannotCloseUntilAppleEnds() {
        var state = AssessmentLabState()
        XCTAssertEqual(state.start(now: 100), .begin)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertFalse(state.mayClose)
        XCTAssertEqual(state.didBegin(now: 102), .none)
        XCTAssertTrue(state.showsQuestion)
        XCTAssertEqual(state.requestEnd(), .end)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertFalse(state.mayClose)
        state.didEnd()
        XCTAssertTrue(state.mayClose)
        XCTAssertEqual(state.phase, .finished)
    }
    func testSixtySecondDeadlineUsesElapsedTimeAndEndsAfterDelayedTimer() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        _ = state.didBegin(now: 3)
        XCTAssertEqual(state.tick(now: 62.2), .none)
        XCTAssertEqual(state.remaining, 1)
        XCTAssertEqual(state.tick(now: 90), .end)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertEqual(state.tick(now: 91), .none)
    }
    func testCancellationThenLateStartNeverRevealsQuestion() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        XCTAssertEqual(state.requestEnd(), .end)
        XCTAssertEqual(state.didBegin(now: 1), .end)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertFalse(state.mayClose)
    }
    func testInterruptionHidesImmediatelyAndNeverReportsSuccess() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        _ = state.didBegin(now: 1)
        XCTAssertEqual(state.interrupt(), .end)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertFalse(state.mayClose)
        state.didEnd()
        XCTAssertEqual(state.phase, .failed)
        XCTAssertTrue(state.mayClose)
    }
    func testDuplicateStartDoesNotReplaceActiveDeadline() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        _ = state.didBegin(now: 1)
        XCTAssertEqual(state.start(now: 55), .none)
        XCTAssertEqual(state.didBegin(now: 55), .none)
        XCTAssertEqual(state.tick(now: 61), .end)
    }
    func testFailedStartAllowsRetryWithoutDisplayingQuestion() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        state.failedToBegin()
        XCTAssertTrue(state.mayClose)
        XCTAssertFalse(state.showsQuestion)
        XCTAssertEqual(state.phase, .failed)
        XCTAssertEqual(state.start(now: 5), .begin)
        XCTAssertFalse(state.mayClose)
    }
    func testStartTimeoutCannotFallThroughIntoActiveQuestion() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        XCTAssertEqual(state.tick(now: 15), .end)
        XCTAssertEqual(state.didBegin(now: 16), .end)
        XCTAssertFalse(state.showsQuestion)
        state.didEnd()
        XCTAssertEqual(state.phase, .failed)
    }
    func testLateStartBeforeTimerTickCannotRevealQuestion() {
        var state = AssessmentLabState()
        _ = state.start(now: 100)
        XCTAssertEqual(state.didBegin(now: 116), .end)
        XCTAssertFalse(state.showsQuestion)
        state.didEnd()
        XCTAssertEqual(state.phase, .failed)
    }
    func testUnexpectedAppleEndIsNotSuccessfulCompletion() {
        var state = AssessmentLabState()
        _ = state.start(now: 0)
        _ = state.didBegin(now: 1)
        state.didEnd()
        XCTAssertEqual(state.phase, .failed)
        XCTAssertTrue(state.mayClose)
        XCTAssertFalse(state.showsQuestion)
    }

    func testSafetyTimerContinuesDuringTrackingRunLoopMode() {
        let checked = expectation(description: "Common-mode safety timer fires while tracking")
        // Production schedules on RunLoop.main. Exercise that same loop even when
        // XCTest invokes this synchronous test on a worker thread.
        DispatchQueue.main.async {
            let tracking = "GradeCrewLabTracking"
            let cfMode = CFStringCreateWithCString(nil, tracking, CFStringBuiltInEncodings.UTF8.rawValue)!
            CFRunLoopAddCommonMode(CFRunLoopGetMain(), CFRunLoopMode(rawValue: cfMode))
            var fired = false
            let timer = AssessmentLabTimer.schedule(every: 0.01) { fired = true }
            defer { timer.invalidate(); checked.fulfill() }
            // A run-loop iteration can return for unrelated wakeups before the
            // timer is due. Keep running only tracking mode until it fires or the
            // bounded deadline expires; a default-mode-only timer must still fail.
            let deadline = Date().addingTimeInterval(2)
            while !fired && Date() < deadline {
                _ = RunLoop.main.run(mode: .init(rawValue: tracking), before: deadline)
            }
            XCTAssertTrue(fired, "Safety deadline must still be checked while scrolling")
        }
        wait(for: [checked], timeout: 3)

    }

}
