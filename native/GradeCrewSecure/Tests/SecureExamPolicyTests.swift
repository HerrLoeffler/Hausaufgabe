import XCTest
@testable import AssessmentLabCore

final class SecureExamPolicyTests: XCTestCase {
    func testFiveMinuteDeadlineExpiresWithoutUsingDeviceWallClock() {
        let clock = SecureExamClock(serverNowMillis: 1_000_000, deadlineMillis: 1_300_000, receivedUptime: 40)
        XCTAssertEqual(clock.remaining(at: 40), 300)
        XCTAssertEqual(clock.remaining(at: 339), 1)
        XCTAssertEqual(clock.remaining(at: 340), 0)
        XCTAssertEqual(clock.remaining(at: 1000), 0)
    }
    func testResumeKeepsOriginalDeadline() {
        let clock = SecureExamClock(serverNowMillis: 1_240_000, deadlineMillis: 1_300_000, receivedUptime: 200)
        XCTAssertEqual(clock.remaining(at: 200), 60)
        XCTAssertEqual(clock.remaining(at: 260), 0)
    }
    func testUntimedAttemptDoesNotExpire() {
        let clock = SecureExamClock(serverNowMillis: 1_000_000, deadlineMillis: nil, receivedUptime: 5)
        XCTAssertNil(clock.remaining(at: 10000))
    }
    func testFinalAnswersCannotBeChangedByLateSnapshotsOrRetry() throws {
        var state = SecureAnswerState()
        XCTAssertTrue(state.accept(revision: 2, answers: Data("{\"q\":\"a\"}".utf8)))
        XCTAssertFalse(state.accept(revision: 1, answers: Data("{\"q\":\"old\"}".utf8)))
        let first = state.freeze()
        XCTAssertFalse(state.accept(revision: 3, answers: Data("{\"q\":\"changed\"}".utf8)))
        XCTAssertEqual(state.freeze(), first)
        let stored = try JSONEncoder().encode(state)
        XCTAssertEqual(try JSONDecoder().decode(SecureAnswerState.self, from: stored).freezeCopy, first)
    }
    func testReceiptRequiresThisAttemptAndARealSubmission() {
        XCTAssertTrue(SecureReceiptPolicy.accepts(["attemptId":"a_123", "submissionId":"a_123", "status":"graded", "submittedAtMillis":1000], attemptID:"a_123"))
        XCTAssertFalse(SecureReceiptPolicy.accepts(["attemptId":"a_other", "submissionId":"a_other", "status":"graded", "submittedAtMillis":1000], attemptID:"a_123"))
        XCTAssertFalse(SecureReceiptPolicy.accepts(["attemptId":"a_123", "submissionId":"a_123", "status":"running"], attemptID:"a_123"))
        XCTAssertFalse(SecureReceiptPolicy.accepts(["attemptId":"a_123", "submissionId":"a_123", "status":"graded"], attemptID:"a_123"))
    }
    func testOnlyOneCompletionCanClaimAnAttemptAndOldCallbacksExpire() {
        var gate = SecureOperationGate()
        let old = gate.generation
        XCTAssertTrue(gate.isCurrent(old))
        XCTAssertTrue(gate.claimCompletion(old))
        XCTAssertFalse(gate.claimCompletion(old))
        gate.invalidate()
        XCTAssertFalse(gate.isCurrent(old))
        XCTAssertFalse(gate.claimCompletion(old))
        let next = gate.generation
        XCTAssertTrue(gate.isCurrent(next))
        XCTAssertTrue(gate.claimCompletion(next))
    }
    func testCodeValidationDoesNotSilentlyChangeInvalidInput() {
        XCTAssertEqual(SecureInputPolicy.code(" ab12cd "), "AB12CD")
        XCTAssertNil(SecureInputPolicy.code("ab/12cd"))
        XCTAssertNil(SecureInputPolicy.code("abc"))
        XCTAssertNil(SecureInputPolicy.code(""))
    }
}
