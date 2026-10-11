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
    var audioQuestionCount = "0"
    var audioAnswerQuestionCount = "0"
    var materialMode = "inspiration"

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
        for key in ["audioQuestionCount", "audioAnswerQuestionCount"] {
            let value = (payload[key] as? Int).map(String.init) ?? payload[key] as? String ?? "0"
            if key == "audioQuestionCount" { audioQuestionCount = value }
            else { audioAnswerQuestionCount = value }
        }
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
        if let value = Double(points.replacingOccurrences(of: ",", with: ".")), value.isFinite, value > 0 { values["points"] = value }
        if let value = Int(imageQuestionCount), (0...5).contains(value) { values["imageQuestionCount"] = value }
        if let value = Int(audioQuestionCount), (0...5).contains(value) { values["audioQuestionCount"] = value }
        if let value = Int(audioAnswerQuestionCount), (0...5).contains(value) { values["audioAnswerQuestionCount"] = value }
        values["materialMode"] = materialMode
        if !wishes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            values["customNotes"] = wishes.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return values
    }

    /// Explicit subject/class/count hints fill immediately; the existing Remy service interprets the full wish.
    @discardableResult
    mutating func applySpeechHints(_ text: String, expectingCount: Bool = false) -> [String: Int] {
        let lower = text.lowercased()
        var expectedMedia: [String: Int] = [:]
        let subjects = [("englisch|english", "Englisch"), ("mathematik|mathe", "Mathematik"),
                        ("deutsch", "Deutsch"), ("sachunterricht|hsu", "Sachunterricht"),
                        ("biologie|bio", "Biologie"), ("geschichte", "Geschichte"),
                        ("geografie|geographie|erdkunde", "Geografie"), ("physik", "Physik"),
                        ("chemie", "Chemie"), ("französisch", "Französisch"),
                        ("religion", "Religion"), ("ethik", "Ethik"), ("musik", "Musik")]
        for (pattern, value) in subjects where lower.range(of: "\\b(?:\(pattern))\\b", options: .regularExpression) != nil {
            subject = value
            break
        }
        let ordinal = ["erste": "1", "zweite": "2", "dritte": "3", "vierte": "4", "fünfte": "5", "sechste": "6",
                       "siebte": "7", "achte": "8", "neunte": "9", "zehnte": "10", "elfte": "11", "zwölfte": "12", "dreizehnte": "13"]
        let numberWords = ["eins": "1", "eine": "1", "zwei": "2", "drei": "3", "vier": "4", "fünf": "5", "sechs": "6",
                           "sieben": "7", "acht": "8", "neun": "9", "zehn": "10", "elf": "11", "zwölf": "12", "fünfzehn": "15", "zwanzig": "20"]
        func firstCapture(_ pattern: String) -> String? {
            guard let regex = try? NSRegularExpression(pattern: pattern),
                  let match = regex.firstMatch(in: lower, range: NSRange(lower.startIndex..., in: lower)),
                  let range = Range(match.range(at: 1), in: lower) else { return nil }
            return String(lower[range])
        }
        let classWords = (Array(ordinal.keys) + Array(numberWords.keys)).sorted { $0.count > $1.count }.joined(separator: "|")
        if let value = firstCapture("\\b(\\d{1,2}|\(classWords))\\.?\\s+(?:klasse|klassenstufe)\\b") ??
                       firstCapture("\\b(?:klasse|klassenstufe)\\s+(\\d{1,2}|\(classWords))\\b") {
            let normalized = ordinal[value] ?? numberWords[value] ?? value
            if let number = Int(normalized), (1...13).contains(number) { grade = normalized }
        }
        let countWords = numberWords.keys.sorted { $0.count > $1.count }.joined(separator: "|")
        let explicitCount = firstCapture("\\b(\\d{1,3}|\(countWords))\\s+aufgaben\\b")
        let reply = lower.trimmingCharacters(in: .whitespacesAndNewlines).trimmingCharacters(in: .punctuationCharacters)
        let value = explicitCount ?? (expectingCount ? reply : "")
        let normalized = numberWords[value] ?? value
        if let number = Int(normalized), (1...100).contains(number) { count = String(number) }
        for (field, pattern) in [
            ("image", "\\b(\\d|\(countWords))\\s+(?:aufgaben mit (?:einem )?bild|bilder|aufgabenbilder)\\b"),
            ("audio", "\\b(\\d|\(countWords))\\s+(?:hör\\s*aufgaben|hör\\s*fragen|listening questions)\\b"),
            ("answers", "\\b(\\d|\(countWords))\\s+(?:aufgaben mit (?:audioantworten|vorgelesenen antworten)|audioantworten|lösungen als audio)\\b")
        ] {
            if let raw = firstCapture(pattern), let number = Int(numberWords[raw] ?? raw), (0...5).contains(number) {
                if field == "image" { imageQuestionCount = String(number) }
                else if field == "audio" { audioQuestionCount = String(number) }
                else { audioAnswerQuestionCount = String(number) }
                let key = field == "image" ? "imageQuestionCount" : field == "audio" ? "audioQuestionCount" : "audioAnswerQuestionCount"
                expectedMedia[key] = number
            }
        }
        for value in ["Grundschule", "Mittelschule", "Realschule", "Gymnasium", "Gesamtschule", "Förderschule", "Berufsschule"] {
            if lower.contains(value.lowercased()) { schoolType = value; break }
        }
        return expectedMedia
    }

    /// Merge the independent full Remy interpretation without losing manually supplied wishes.
    mutating func applyAssistantPatch(_ patch: [String: Any], expectedMedia: [String: Int]) throws -> [String] {
        var next = self
        var mismatches: [String] = []
        func invalid() -> NSError {
            NSError(domain: "GradeCrewQuickRemy", code: 2, userInfo: [NSLocalizedDescriptionKey: "Remys Gegenprüfung hat ungültige Angaben geliefert. Bitte erneut versuchen."])
        }
        for (key, maximum) in [("subject", 120), ("grade", 60), ("topic", 500), ("schoolType", 100), ("region", 100), ("notes", 1500)] {
            guard let raw = patch[key], !(raw is NSNull) else { continue }
            guard let value = raw as? String, value.count <= maximum else { throw invalid() }
            let text = value.trimmingCharacters(in: .whitespacesAndNewlines)
            if text.isEmpty { continue }
            switch key {
            case "subject": next.subject = text
            case "grade": next.grade = text
            case "topic": next.topic = text
            case "schoolType": next.schoolType = text
            case "region": next.region = text
            default:
                if next.wishes.range(of: text, options: .caseInsensitive) == nil {
                    next.wishes = next.wishes.isEmpty ? text : "\(next.wishes)\n\(text)"
                }
            }
        }
        if let raw = patch["difficulty"], !(raw is NSNull) {
            guard let value = raw as? String, ["leicht", "mittel", "anspruchsvoll", "gemischt"].contains(value) else { throw invalid() }
            next.difficulty = value
        }
        for (key, maximum) in [("count", 100), ("imageQuestionCount", 5), ("audioQuestionCount", 5), ("audioAnswerQuestionCount", 5)] {
            guard let raw = patch[key], !(raw is NSNull) else { continue }
            guard let value = raw as? Int, (key == "count" ? 1 : 0)...maximum ~= value else { throw invalid() }
            if let expected = expectedMedia[key], value != expected { mismatches.append(key); continue }
            switch key {
            case "count": next.count = String(value)
            case "imageQuestionCount": next.imageQuestionCount = String(value)
            case "audioQuestionCount": next.audioQuestionCount = String(value)
            default: next.audioAnswerQuestionCount = String(value)
            }
        }
        if let raw = patch["points"], !(raw is NSNull) {
            guard let value = raw as? Double, value.isFinite, value >= 0.5 else { throw invalid() }
            next.points = String(value)
        }
        if let duration = patch["durationMinutes"] as? Int, duration > 0 {
            let note = "Gewünschte Bearbeitungszeit: ca. \(duration) Minuten."
            if !next.wishes.contains(note) { next.wishes = next.wishes.isEmpty ? note : "\(next.wishes)\n\(note)" }
        }
        self = next
        return mismatches
    }

    func validationError(allowedTypes: Set<String>) -> String? {
        guard preparedRequest != nil else { return "Bitte Fach, Klasse, Thema und Aufgabenanzahl ergänzen." }
        let tasks = Int(count) ?? 0
        guard let total = Double(points.replacingOccurrences(of: ",", with: ".")), total.isFinite, total >= Double(tasks) / 2,
              abs(total * 2 - (total * 2).rounded()) < 0.0001 else { return "Gesamtpunkte bitte in 0,5er-Schritten und mindestens 0,5 Punkte je Aufgabe wählen." }
        for (label, value) in [("Bilder", imageQuestionCount), ("Höraufgaben", audioQuestionCount), ("Audioantworten", audioAnswerQuestionCount)] {
            guard let number = Int(value), (0...min(5, tasks)).contains(number) else { return "Für \(label) bitte 0 bis \(min(5, tasks)) wählen." }
        }
        guard !allowedTypes.isEmpty else { return "Bitte mindestens einen Aufgabentyp auswählen." }
        if (Int(audioAnswerQuestionCount) ?? 0) > 0 && allowedTypes.isDisjoint(with: ["single", "multi"]) {
            return "Für Audioantworten bitte Einzel- oder Mehrfachauswahl erlauben."
        }
        return nil
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
