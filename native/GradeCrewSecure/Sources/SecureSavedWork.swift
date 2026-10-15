import Foundation
struct SecureExamPresentation:Codable {
    let touchedQuestionIDs:[String]
    func validated(allowedIDs:Set<String>)->Self? {
        guard touchedQuestionIDs.count<=allowedIDs.count,
              Set(touchedQuestionIDs).count==touchedQuestionIDs.count,
              Set(touchedQuestionIDs).isSubset(of:allowedIDs) else { return nil }
        return self
    }
}
struct SecureSavedWork:Codable {
    var answers=SecureAnswerState()
    var response:Data?
    var autoSubmitted=false
    var presentation:SecureExamPresentation?
    mutating func updatePresentation(_ candidate:SecureExamPresentation?,allowedIDs:Set<String>) {
        if let valid=candidate?.validated(allowedIDs:allowedIDs) { presentation=valid }
    }
}
