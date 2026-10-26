import XCTest
@testable import GradeCrewSecureLayoutHost

private final class LegacyPendingStore:SecureAttemptPersistence {
    var reads=0
    var writes=0
    var pending=true
    var fail=false
    func legacyTestWorkExists() throws -> Bool { if fail {throw NSError(domain:"Synthetic",code:1)};return pending }
    func identity() throws -> SecureAttemptIdentity? { reads+=1; return nil }
    func work() throws -> SecureSavedWork { SecureSavedWork() }
    func save(identity:SecureAttemptIdentity,work:SecureSavedWork) throws { writes+=1 }
    func clear() throws { writes+=1 }
}
@MainActor final class SecureLegacyEnvironmentTests:XCTestCase {
    func test_pending_old_test_work_blocks_live_without_reading_or_clearing_it() async {
        let store=LegacyPendingStore(), model=SecureExamCoordinator(store:store)
        XCTAssertEqual(model.phase,.recovery)
        XCTAssertEqual(store.reads,0)
        XCTAssertEqual(store.writes,0)
        model.code="AB12CD";model.name="Synthetic"
        await model.preflight()
        await model.startOrRecover()
        XCTAssertEqual(model.phase,.recovery)
        XCTAssertEqual(store.writes,0)
    }
    func test_failed_legacy_check_blocks_new_attempt_without_storage_mutation() async {
        let store=LegacyPendingStore();store.fail=true
        let model=SecureExamCoordinator(store:store)
        XCTAssertTrue(model.legacyTestWorkBlocked)
        await model.preflight();await model.startOrRecover()
        XCTAssertEqual(store.reads,0);XCTAssertEqual(store.writes,0)
    }
    func test_empty_legacy_store_keeps_existing_entry() {
        let store=LegacyPendingStore();store.pending=false
        let model=SecureExamCoordinator(store:store)
        XCTAssertEqual(model.phase,.code)
        XCTAssertEqual(store.reads,1)
    }
}
