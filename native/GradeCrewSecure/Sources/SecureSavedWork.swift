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
    var recoveryReason:String?
    var presentation:SecureExamPresentation?
    mutating func updatePresentation(_ candidate:SecureExamPresentation?,allowedIDs:Set<String>) {
        if let valid=candidate?.validated(allowedIDs:allowedIDs) { presentation=valid }
    }
}

struct SecureWorkEnvelope:Codable {
    let version:Int
    let code:String
    let clientID:String
    let work:SecureSavedWork
    static func encode(_ work:SecureSavedWork,code:String,clientID:String) throws -> Data {
        try JSONEncoder().encode(Self(version:1,code:code,clientID:clientID,work:work))
    }
    static func decode(_ data:Data,code:String,clientID:String,attemptID:String?) throws -> SecureSavedWork {
        let object=try JSONSerialization.jsonObject(with:data) as? [String:Any]
        if object?["version"] != nil {
            let envelope=try JSONDecoder().decode(Self.self,from:data)
            guard envelope.version == 1,envelope.code == code,envelope.clientID == clientID else { throw mismatch() }
            return envelope.work
        }
        // Installed Live builds stored the server response inside the work file.
        let legacy=try JSONDecoder().decode(SecureSavedWork.self,from:data)
        if let attemptID {
            guard let response=legacy.response,
                  let saved=try JSONSerialization.jsonObject(with:response) as? [String:Any],
                  saved["attemptId"] as? String == attemptID else { throw mismatch() }
        } else if legacy.answers.revision != 0 || legacy.answers.frozen != nil { throw mismatch() }
        return legacy
    }
    private static func mismatch()->NSError {
        NSError(domain:"GradeCrewSecureStorage",code:2,userInfo:[NSLocalizedDescriptionKey:"Der gespeicherte Stand gehört nicht eindeutig zu diesem Versuch. Bitte die Lehrkraft informieren; die Datei bleibt erhalten."])
    }
}
