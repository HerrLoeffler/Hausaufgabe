import Foundation

/// Editable, locally retained fields returned by Remy's preparation endpoint.
struct QuickRemyDraft {
    var subject = ""
    var grade = ""
    var topic = ""
    var count = ""

    init(payload: [String: Any] = [:]) {
        subject = (payload["subject"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        grade = (payload["grade"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        topic = (payload["topic"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if let number = payload["count"] as? Int, (1...100).contains(number) {
            count = String(number)
        } else if let value = payload["count"] as? String {
            count = value.trimmingCharacters(in: .whitespacesAndNewlines)
        }
    }

    var hasValues: Bool {
        !subject.isEmpty || !grade.isEmpty || !topic.isEmpty || !count.isEmpty
    }

    var knownFieldsPayload: [String: Any] {
        var values: [String: Any] = [:]
        for (field, value) in [("subject", subject), ("grade", grade), ("topic", topic)] {
            let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
            if !trimmed.isEmpty { values[field] = trimmed }
        }
        if let number = Int(count), (1...100).contains(number) { values["count"] = number }
        return values
    }

    var preparedRequest: [String: Any]? {
        let values = knownFieldsPayload
        guard let subject = values["subject"] as? String,
              let grade = values["grade"] as? String,
              let topic = values["topic"] as? String,
              let count = values["count"] as? Int else { return nil }
        return ["subject": subject, "grade": grade, "topic": topic, "count": count]
    }
}
