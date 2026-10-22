import Foundation

final class SecureAssessmentAPI {
    struct Failure: LocalizedError {
        let code: String
        let message: String
        var retryable: Bool { ["UNAVAILABLE", "INTERNAL", "NETWORK"].contains(code) }
        var errorDescription: String? { message }
    }
    private let session: URLSession
    init(session: URLSession = .shared) { self.session = session }
    func invoke(_ name: String, data: [String: Any]) async throws -> [String: Any] {
        guard ["getAssessmentInfo", "startAssessmentAttempt", "resumeAssessmentAttempt", "submitAssessmentAttempt", "getAssessmentReceipt", "recordSecureExamTelemetry", "classroomAccess"].contains(name) else {
            throw Failure(code: "INVALID_ARGUMENT", message: "Unbekannte Prüfungsanfrage.")
        }
        let url = SecureReleaseEnvironment.functionsURL.appendingPathComponent(name)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 20
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("no-store", forHTTPHeaderField: "Cache-Control")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["data": data])
        let bytes: Data
        let response: URLResponse
        do { (bytes, response) = try await session.data(for: request) }
        catch { throw Failure(code: "NETWORK", message: "Keine Verbindung. Deine gespeicherten Antworten bleiben auf diesem Gerät erhalten.") }
        if let http=response as? HTTPURLResponse, http.statusCode >= 500 {
            throw Failure(code:"UNAVAILABLE",message:"Der Prüfungsserver ist vorübergehend nicht erreichbar. Die gesicherte Abgabe wird erneut übertragen.")
        }
        guard let json = (try? JSONSerialization.jsonObject(with: bytes)) as? [String: Any] else {
            throw Failure(code: "INVALID_RESPONSE", message: "Ungültige Antwort des Prüfungsservers.")
        }
        if let error = json["error"] as? [String: Any] {
            throw Failure(code: error["status"] as? String ?? "UNKNOWN", message: error["message"] as? String ?? "Anfrage fehlgeschlagen.")
        }
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode),
              let result = (json["result"] ?? json["data"]) as? [String: Any] else {
            throw Failure(code: "INVALID_RESPONSE", message: "Der Prüfungsserver hat die Anfrage nicht bestätigt.")
        }
        return result
    }
}
