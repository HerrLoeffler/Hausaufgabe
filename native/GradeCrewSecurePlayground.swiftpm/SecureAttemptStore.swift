import Foundation
import Security

/// Device-local recovery for one active GradeCrew Secure attempt.
/// Credentials and unsent answers never go into UserDefaults, URLs or logs.
final class SecureAttemptStore {
    static let shared = SecureAttemptStore()

    private let service = "de.gradecrew.secure.active-attempt"
    private let credentialsAccount = "credentials"
    private let recoveryAccount = "recovery"

    private init() {}

    func saveCredentials(_ credentials: SecureAttemptCredentials) throws {
        let data = try JSONEncoder().encode(credentials)
        try write(data, account: credentialsAccount)
    }

    func loadCredentials() -> SecureAttemptCredentials? {
        guard let data = read(account: credentialsAccount) else { return nil }
        return try? JSONDecoder().decode(SecureAttemptCredentials.self, from: data)
    }

    func saveRecovery(revision: Int, answers: [String: Any]) throws {
        let envelope: [String: Any] = [
            "revision": max(0, revision),
            "answers": answers
        ]
        guard JSONSerialization.isValidJSONObject(envelope) else { return }
        let data = try JSONSerialization.data(withJSONObject: envelope, options: [])
        // Guard against unexpectedly huge client state. The server remains the
        // canonical autosave; this local copy only bridges temporary outages/crashes.
        guard data.count <= 900_000 else { return }
        try write(data, account: recoveryAccount)
    }

    func loadRecoveryObject() -> [String: Any]? {
        guard let data = read(account: recoveryAccount),
              let value = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        return value
    }

    func clearRecovery() {
        delete(account: recoveryAccount)
    }

    func clearAll() {
        delete(account: credentialsAccount)
        delete(account: recoveryAccount)
    }

    private func write(_ data: Data, account: String) throws {
        let base: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        let update: [String: Any] = [
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        let status = SecItemUpdate(base as CFDictionary, update as CFDictionary)
        if status == errSecSuccess { return }
        if status != errSecItemNotFound { throw KeychainError(status: status) }

        var add = base
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let addStatus = SecItemAdd(add as CFDictionary, nil)
        guard addStatus == errSecSuccess else { throw KeychainError(status: addStatus) }
    }

    private func read(account: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess else { return nil }
        return item as? Data
    }

    private func delete(account: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
    }
}

private struct KeychainError: LocalizedError {
    let status: OSStatus
    var errorDescription: String? {
        (SecCopyErrorMessageString(status, nil) as String?) ?? "Keychain-Fehler \(status)"
    }
}
