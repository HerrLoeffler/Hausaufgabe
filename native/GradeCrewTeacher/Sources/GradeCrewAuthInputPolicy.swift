import Foundation

enum GradeCrewAuthInputPolicy {
    enum Mode { case login, register, reset }

    struct Request {
        let action: String
        let payload: [String: String]
    }

    enum InvalidInput: LocalizedError {
        case email, name, password, shortPassword

        var errorDescription: String? {
            switch self {
            case .email: return "Bitte gib eine gültige E-Mail-Adresse ein."
            case .name: return "Bitte gib deinen Namen ein."
            case .password: return "Bitte gib dein Passwort ein."
            case .shortPassword: return "Dein Passwort muss mindestens 6 Zeichen lang sein."
            }
        }
    }

    static func request(mode: Mode, name: String, email: String, password: String) throws -> Request {
        // Outer spaces are harmless typing noise; control characters are never an address.
        guard !email.unicodeScalars.contains(where: { CharacterSet.controlCharacters.contains($0) }) else {
            throw InvalidInput.email
        }
        let email = email.trimmingCharacters(in: .whitespaces)
        guard isEmailAddress(email) else { throw InvalidInput.email }
        if mode == .reset { return Request(action: "authReset", payload: ["email": email]) }
        let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if mode == .register && name.isEmpty { throw InvalidInput.name }
        guard !password.isEmpty else { throw InvalidInput.password }
        // Match the existing web form's HTML minlength semantics.
        if mode == .register && password.utf16.count < 6 { throw InvalidInput.shortPassword }
        // Passwords stay byte-for-byte as entered, including spaces.
        var payload = ["email": email, "password": password]
        if mode == .register { payload["name"] = name }
        return Request(action: mode == .register ? "authRegister" : "authLogin", payload: payload)
    }

    private static func isEmailAddress(_ email: String) -> Bool {
        guard email.utf8.count <= 254 else { return false }
        let parts = email.split(separator: "@", omittingEmptySubsequences: false)
        guard parts.count == 2 else { return false }
        let local = String(parts[0])
        let domain = String(parts[1])
        let localCharacters = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!#$%&'*+-/=?^_`{|}~")
        guard !local.isEmpty, local.utf8.count <= 64,
              !local.hasPrefix("."), !local.hasSuffix("."), !local.contains(".."),
              local.unicodeScalars.allSatisfy({ localCharacters.contains($0) }) else { return false }
        let labels = domain.split(separator: ".", omittingEmptySubsequences: false)
        let domainCharacters = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
        guard labels.count >= 2, labels.allSatisfy({ label in
            !label.isEmpty && label.utf8.count <= 63 && !label.hasPrefix("-") && !label.hasSuffix("-") &&
            label.unicodeScalars.allSatisfy { domainCharacters.contains($0) }
        }) else { return false }
        guard let suffix = labels.last, suffix.count >= 2,
              suffix.unicodeScalars.allSatisfy({ CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ").contains($0) }) else { return false }
        return true
    }
}
