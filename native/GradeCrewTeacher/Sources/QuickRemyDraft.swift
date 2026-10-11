import Foundation

/// Editable values used by Remy's native test form and the authenticated GradeCrew form.
struct QuickRemyDraft {
    var subject = ""
    var grade = ""
    var topic = ""
    var count = ""
    var wishes = ""
    var schoolType = "Mittelschule"
    var region = "Bayern"
    var difficulty = "mittel"
    var points = "20"
    var imageQuestionCount = "0"

    init(payload: [String: Any] = [:]) {
        subject = (payload["subject"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        grade = (payload["grade"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        topic = (payload["topic"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        wishes = (payload["customNotes"] as? String ?? payload["wishes"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        schoolType = (payload["schoolType"] as? String ?? schoolType).trimmingCharacters(in: .whitespacesAndNewlines)
        region = (payload["region"] as? String ?? region).trimmingCharacters(in: .whitespacesAndNewlines)
        difficulty = (payload["difficulty"] as? String ?? difficulty).trimmingCharacters(in: .whitespacesAndNewlines)
        if let value = payload["points"] as? Int { points = String(value) }
        else if let value = payload["points"] as? Double { points = String(value) }
        else if let value = payload["points"] as? String { points = value }
        if let value = payload["imageQuestionCount"] as? Int { imageQuestionCount = String(value) }
        else if let value = payload["imageQuestionCount"] as? String { imageQuestionCount = value }
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
        values["schoolType"] = schoolType
        values["region"] = region
        values["difficulty"] = difficulty
        if let value = Double(points), value > 0 { values["points"] = value }
        if let value = Int(imageQuestionCount), (0...5).contains(value) { values["imageQuestionCount"] = value }
        if !wishes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            values["customNotes"] = wishes.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return values
    }

    var preparedRequest: [String: Any]? {
        let values = knownFieldsPayload
        guard let subject = values["subject"] as? String,
              let grade = values["grade"] as? String,
              let topic = values["topic"] as? String,
              let count = values["count"] as? Int else { return nil }
        var request: [String: Any] = ["subject": subject, "grade": grade, "topic": topic, "count": count]
        if let customNotes = values["customNotes"] { request["customNotes"] = customNotes }
        return request
    }
}
