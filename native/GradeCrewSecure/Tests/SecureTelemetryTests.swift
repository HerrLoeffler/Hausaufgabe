import XCTest
@testable import AssessmentLabCore
final class SecureTelemetryTests:XCTestCase {
    func testProgressCoalescesAndAcknowledgementCannotDeleteAnotherEvent() {
        var queue=SecureTelemetryQueue()
        let first=SecureTelemetryEnvelope(quizId:"ABCD",attemptId:"a_123",attemptToken:"secret",event:.init(kind:"started",observedAt:1))
        var next=first;next.event = .init(kind:"progress",observedAt:2)
        queue.append(first);queue.append(next)
        var latest=next;latest.event = .init(kind:"progress",observedAt:3)
        queue.append(latest)
        XCTAssertEqual(queue.entries.count,2)
        queue.acknowledge(next.event.eventId)
        XCTAssertEqual(queue.entries.count,2)
        queue.acknowledge(first.event.eventId)
        XCTAssertEqual(queue.entries.first?.event.observedAt,3)
    }
    func testQueueIsBoundedSurvivesCodingAndExpiresWithoutExposure() throws {
        var queue=SecureTelemetryQueue()
        for n in 0..<200 { queue.append(.init(quizId:"ABCD",attemptId:"a_123",attemptToken:"secret",event:.init(kind:"started",observedAt:Int64(n)))) }
        XCTAssertLessThanOrEqual(queue.entries.count,128)
        let restored=try JSONDecoder().decode(SecureTelemetryQueue.self,from:JSONEncoder().encode(queue))
        XCTAssertEqual(restored.entries.count,queue.entries.count)
        queue.expire(before:1000);XCTAssertTrue(queue.entries.isEmpty)
    }
}
