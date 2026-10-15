import Foundation

struct SecureExamClock {
    let serverNowMillis: Double
    let deadlineMillis: Double?
    let receivedUptime: TimeInterval
    func remaining(at uptime: TimeInterval) -> Int? {
        guard let deadlineMillis else { return nil }
        let elapsed = max(0, uptime - receivedUptime) * 1000
        return max(0, Int(ceil((deadlineMillis - serverNowMillis - elapsed) / 1000)))
    }
}
struct SecureAnswerState: Codable {
    private(set) var revision = 0
    private(set) var answers = Data("{}".utf8)
    private(set) var frozen: Data?
    var freezeCopy: Data? { frozen }
    mutating func accept(revision: Int, answers: Data) -> Bool {
        guard frozen == nil, revision >= self.revision, answers.count <= 850_000,
              (try? JSONSerialization.jsonObject(with: answers)) is [String: Any] else { return false }
        self.revision = revision
        self.answers = answers
        return true
    }
    mutating func freeze() -> Data {
        if frozen == nil { frozen = answers }
        return frozen!
    }
}
enum SecureReceiptPolicy {
    static func accepts(_ receipt: [String: Any], attemptID: String) -> Bool {
        receipt["attemptId"] as? String == attemptID &&
        receipt["submissionId"] as? String == attemptID &&
        ["graded", "review"].contains(receipt["status"] as? String ?? "") &&
        ((receipt["submittedAtMillis"] as? NSNumber)?.doubleValue ?? 0) > 0
    }
}
enum SecureInputPolicy {
    static func code(_ text: String) -> String? {
        let code = text.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        return code.range(of: "^[A-Z0-9]{4,16}$", options: .regularExpression) == nil ? nil : code
    }
}

// ContinuousClock advances through device sleep; wall-clock changes cannot extend a running exam.
enum SecureMonotonic {
    private static let origin = ContinuousClock.now
    static var now: TimeInterval {
        let value = origin.duration(to: .now).components
        return Double(value.seconds) + Double(value.attoseconds) / 1e18
    }
}

// Every async result belongs to one attempt lifecycle. Completion has one owner.
struct SecureOperationGate {
    private(set) var generation = UUID()
    private(set) var completionClaimed = false
    func isCurrent(_ generation: UUID) -> Bool { self.generation == generation }
    mutating func claimCompletion(_ generation: UUID) -> Bool {
        guard isCurrent(generation), !completionClaimed else { return false }
        completionClaimed = true
        return true
    }
    mutating func abandonCompletion(_ generation: UUID) {
        if isCurrent(generation) { completionClaimed = false }
    }
    mutating func invalidate() { generation = UUID(); completionClaimed = false }
}

enum SecureSubmissionSummary {
    static func title(total:Int,completed:Int?) -> String {
        guard total>0, let completed, (0..<total).contains(completed) else { return "Antworten verbindlich abgeben?" }
        let open=total-completed
        return "Noch \(open) \(open == 1 ? "Aufgabe" : "Aufgaben") offen. Trotzdem abgeben?"
    }
}
