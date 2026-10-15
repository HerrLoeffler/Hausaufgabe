import Foundation

/// Pure lifecycle for the local dummy test; never authorizes a server exam.
struct AssessmentLabState {
    enum Phase: Equatable { case idle, starting, active, ending, finished, failed }
    enum Action: Equatable { case none, begin, end }
    private(set) var phase: Phase = .idle
    private(set) var remaining = 60
    private var deadline: TimeInterval = 0
    private var failed = false
    var showsQuestion: Bool { phase == .active }
    var mayClose: Bool { phase == .idle || phase == .finished || phase == .failed }

    mutating func start(now: TimeInterval) -> Action {
        guard mayClose else { return .none }
        failed = false
        remaining = 60
        deadline = now + 15
        phase = .starting
        return .begin
    }
    mutating func didBegin(now: TimeInterval) -> Action {
        if phase == .active { return .none }
        guard phase == .starting else { return .end }
        guard now < deadline else {
            failed = true
            phase = .ending
            return .end
        }
        deadline = now + 60
        phase = .active
        return .none
    }
    mutating func requestEnd() -> Action {
        guard phase == .active || phase == .starting else { return .none }
        phase = .ending
        return .end
    }
    mutating func tick(now: TimeInterval) -> Action {
        if phase == .starting && now >= deadline {
            failed = true
            return requestEnd()
        }
        guard phase == .active else { return .none }
        remaining = max(0, Int(ceil(deadline - now)))
        return remaining == 0 ? requestEnd() : .none
    }
    mutating func interrupt() -> Action {
        guard !mayClose else { return .none }
        failed = true
        phase = .ending
        return .end
    }
    mutating func didEnd() {
        guard !mayClose else { return }
        // Unexpected OS end is a failure, not a successful lab result.
        if phase != .ending { failed = true }
        phase = failed ? .failed : .finished
    }
    mutating func failedToBegin() {
        guard phase == .starting || phase == .ending else { return }
        failed = true
        phase = .failed
    }
}
