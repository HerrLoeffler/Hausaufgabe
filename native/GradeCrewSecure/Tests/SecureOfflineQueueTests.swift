import XCTest
@testable import AssessmentLabCore
final class SecureOfflineQueueTests:XCTestCase {
    func testBoundFrozenWorkSurvivesRestartAndRejectsAnotherAttempt() throws {
        var work=SecureSavedWork()
        XCTAssertTrue(work.answers.accept(revision:7,answers:Data("{\"q1\":\"saved\"}".utf8)))
        let frozen=work.answers.freeze()
        let bytes=try SecureWorkEnvelope.encode(work,code:"QA1234",clientID:"client-one")
        let restored=try SecureWorkEnvelope.decode(bytes,code:"QA1234",clientID:"client-one",attemptID:"a_one")
        XCTAssertEqual(restored.answers.frozen,frozen)
        XCTAssertThrowsError(try SecureWorkEnvelope.decode(bytes,code:"QA9999",clientID:"client-two",attemptID:"a_two"))
    }
    func testLegacyWorkRequiresMatchingServerAttemptBeforeMigration() throws {
        var work=SecureSavedWork()
        work.response=Data("{\"attemptId\":\"a_old\"}".utf8)
        let bytes=try JSONEncoder().encode(work)
        XCTAssertNoThrow(try SecureWorkEnvelope.decode(bytes,code:"QA1234",clientID:"client-one",attemptID:"a_old"))
        XCTAssertThrowsError(try SecureWorkEnvelope.decode(bytes,code:"QA1234",clientID:"client-one",attemptID:"a_other"))
    }
}
