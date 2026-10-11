import Foundation

enum QuickRemyFollowUpPolicy {
    private static let requiredFields: Set<String> = ["subject", "grade", "topic", "count"]

    static func question(status: String?, missingFields: [String]?, question: String?) -> String? {
        guard status == "needsInfo",
              let missingFields,
              !missingFields.isEmpty,
              missingFields.count <= requiredFields.count,
              Set(missingFields).count == missingFields.count,
              Set(missingFields).isSubset(of: requiredFields),
              let question else { return nil }
        let trimmed = question.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, trimmed.utf16.count <= 280 else { return nil }
        return trimmed
    }
}
