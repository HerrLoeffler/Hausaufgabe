import Foundation

struct SecureTestMetadata: Codable, Equatable {
    let code: String
    let title: String
    let subject: String
    let grade: String
    let description: String
    let timeLimitMinutes: Int?
    let startMode: String
    let sessionState: String
    let totalPoints: Double?
    let secureExamEnabled: Bool
}

struct SecureAttemptCredentials: Codable, Equatable {
    let code: String
    let attemptId: String
    let attemptToken: String
    let studentName: String
    let test: SecureTestMetadata
}

struct SecurePreflightResult {
    let test: SecureTestMetadata
    let canStartNow: Bool
    let pilot: Bool
}

struct SecurePrepareResult {
    let credentials: SecureAttemptCredentials
    let status: String
    let canStartNow: Bool
}

struct SecureStatusResult {
    let status: String
    let canStartNow: Bool
    let test: SecureTestMetadata
    let startedAt: Double?
    let deadlineAt: Double?
}

struct SecureVerifyResult {
    let submitted: Bool
    let receipt: String?
}

enum SecureExamAPIError: LocalizedError {
    case invalidResponse
    case server(code: String, message: String)
    case transport(String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "GradeCrew hat eine ungültige Serverantwort erhalten."
        case .server(_, let message):
            return message
        case .transport(let message):
            return message
        }
    }

    var isTransportFailure: Bool {
        if case .transport = self { return true }
        return false
    }
}

final class SecureExamAPI {
    static let shared = SecureExamAPI()

    // This branch deliberately talks only to Staging. Production is enabled only
    // in a later release after the secure flow has passed the full pilot.
    private let endpoint = URL(string: "https://europe-west1-hausaufgabe-staging.cloudfunctions.net/secureExamApi")!

    private init() {}

    func preflight(code: String) async throws -> SecurePreflightResult {
        let json = try await call(action: "preflight", payload: ["code": code])
        guard let test = decodeMetadata(json["test"]) else { throw SecureExamAPIError.invalidResponse }
        return SecurePreflightResult(
            test: test,
            canStartNow: json["canStartNow"] as? Bool ?? false,
            pilot: json["pilot"] as? Bool ?? false
        )
    }

    /// Prepare is idempotent even if the network drops after the server committed
    /// the attempt but before the iPad received the response. The same locally
    /// generated request id + bearer token are reused for every retry here.
    func prepare(code: String, studentName: String) async throws -> SecurePrepareResult {
        let prepareId = UUID().uuidString
        let attemptToken = UUID().uuidString.replacingOccurrences(of: "-", with: "")
            + UUID().uuidString.replacingOccurrences(of: "-", with: "")
        let payload: [String: Any] = [
            "code": code,
            "studentName": studentName,
            "prepareId": prepareId,
            "attemptToken": attemptToken
        ]

        var json: [String: Any]?
        var lastError: Error?
        for retry in 0..<3 {
            do {
                json = try await call(action: "prepare", payload: payload)
                break
            } catch let error as SecureExamAPIError where error.isTransportFailure && retry < 2 {
                lastError = error
                try? await Task.sleep(for: .milliseconds(350 * (retry + 1)))
            } catch {
                throw error
            }
        }
        guard let json else { throw lastError ?? SecureExamAPIError.invalidResponse }
        guard
            let attemptId = json["attemptId"] as? String,
            let returnedToken = json["attemptToken"] as? String,
            returnedToken == attemptToken,
            let test = decodeMetadata(json["test"])
        else { throw SecureExamAPIError.invalidResponse }

        let credentials = SecureAttemptCredentials(
            code: code.uppercased(),
            attemptId: attemptId,
            attemptToken: returnedToken,
            studentName: studentName,
            test: test
        )
        return SecurePrepareResult(
            credentials: credentials,
            status: json["status"] as? String ?? "prepared",
            canStartNow: json["canStartNow"] as? Bool ?? false
        )
    }

    func status(_ credentials: SecureAttemptCredentials) async throws -> SecureStatusResult {
        let json = try await callAuthenticated(action: "status", credentials: credentials)
        guard let test = decodeMetadata(json["test"]) else { throw SecureExamAPIError.invalidResponse }
        return SecureStatusResult(
            status: json["status"] as? String ?? "unknown",
            canStartNow: json["canStartNow"] as? Bool ?? false,
            test: test,
            startedAt: number(json["startedAt"]),
            deadlineAt: number(json["deadlineAt"])
        )
    }

    func verify(_ credentials: SecureAttemptCredentials) async throws -> SecureVerifyResult {
        let json = try await callAuthenticated(action: "verify", credentials: credentials)
        return SecureVerifyResult(
            submitted: json["submitted"] as? Bool ?? false,
            receipt: json["receipt"] as? String
        )
    }

    func abort(_ credentials: SecureAttemptCredentials) async {
        _ = try? await callAuthenticated(action: "abort", credentials: credentials)
    }

    private func callAuthenticated(action: String, credentials: SecureAttemptCredentials) async throws -> [String: Any] {
        try await call(action: action, payload: [
            "code": credentials.code,
            "attemptId": credentials.attemptId,
            "attemptToken": credentials.attemptToken
        ])
    }

    private func call(action: String, payload: [String: Any]) async throws -> [String: Any] {
        var body = payload
        body["action"] = action

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        request.timeoutInterval = 20
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("no-store", forHTTPHeaderField: "Cache-Control")
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw SecureExamAPIError.invalidResponse }
            guard let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                throw SecureExamAPIError.invalidResponse
            }
            if !(200..<300).contains(http.statusCode) || object["ok"] as? Bool == false {
                throw SecureExamAPIError.server(
                    code: object["error"] as? String ?? "http-\(http.statusCode)",
                    message: object["message"] as? String ?? "GradeCrew Secure konnte die Anfrage nicht abschließen."
                )
            }
            return object
        } catch let error as SecureExamAPIError {
            throw error
        } catch {
            throw SecureExamAPIError.transport("Keine Verbindung zu GradeCrew. Bitte WLAN prüfen und erneut versuchen.")
        }
    }

    private func decodeMetadata(_ value: Any?) -> SecureTestMetadata? {
        guard let dictionary = value as? [String: Any],
              let data = try? JSONSerialization.data(withJSONObject: dictionary),
              let metadata = try? JSONDecoder().decode(SecureTestMetadata.self, from: data) else { return nil }
        return metadata
    }

    private func number(_ value: Any?) -> Double? {
        if let value = value as? Double { return value }
        if let value = value as? Int { return Double(value) }
        if let value = value as? NSNumber { return value.doubleValue }
        return nil
    }
}
