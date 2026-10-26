import Foundation

// Deadline only reports a failure; it never grants access or changes auth state.
struct GradeCrewAuthRestoreDeadline {
    static let seconds: TimeInterval = 20
    private var revision = 0
    private var startedAt: TimeInterval?
    mutating func begin(at now: TimeInterval) -> Int {
        revision += 1
        startedAt = now
        return revision
    }
    mutating func finish() { revision += 1; startedAt = nil }
    func expired(_ ticket: Int, at now: TimeInterval) -> Bool {
        guard ticket == revision, let startedAt else { return false }
        return now - startedAt >= Self.seconds
    }
}
