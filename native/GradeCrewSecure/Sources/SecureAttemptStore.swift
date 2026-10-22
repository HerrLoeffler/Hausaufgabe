import Foundation
import Security

struct SecureAttemptIdentity: Codable {
    var code: String
    var name: String
    var clientID = UUID().uuidString.replacingOccurrences(of: "-", with: "")
    var token = UUID().uuidString.replacingOccurrences(of: "-", with: "") + UUID().uuidString.replacingOccurrences(of: "-", with: "")
    var attemptID: String?
    var classroom: SecureClassroomLaunch?
    var startRequestSent: Bool?
}
protocol SecureAttemptPersistence {
    func identity() throws -> SecureAttemptIdentity?
    func work() throws -> SecureSavedWork
    func save(identity:SecureAttemptIdentity,work:SecureSavedWork) throws
    func clear() throws
}
final class SecureAttemptStore:SecureAttemptPersistence {
    private let service = SecureReleaseEnvironment.attemptService
    private var directory: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent(SecureReleaseEnvironment.workDirectory, isDirectory: true)
    }
    private var file: URL { directory.appendingPathComponent("answers.json") }
    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: "identity"]
    }
    func identity() throws -> SecureAttemptIdentity? {
        var request = query
        request[kSecReturnData as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = result as? Data else { throw storeError() }
        return try JSONDecoder().decode(SecureAttemptIdentity.self, from: data)
    }
    func work() throws -> SecureSavedWork {
        guard FileManager.default.fileExists(atPath: file.path) else { return SecureSavedWork() }
        guard let identity = try identity() else { throw storeError() }
        return try SecureWorkEnvelope.decode(Data(contentsOf:file),code:identity.code,clientID:identity.clientID,attemptID:identity.attemptID)
    }
    func save(identity: SecureAttemptIdentity, work: SecureSavedWork) throws {
        let data = try JSONEncoder().encode(identity)
        let value: [String: Any] = [kSecValueData as String: data, kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        let update = SecItemUpdate(query as CFDictionary, value as CFDictionary)
        if update == errSecItemNotFound {
            var add = query
            value.forEach { add[$0.key] = $0.value }
            guard SecItemAdd(add as CFDictionary, nil) == errSecSuccess else { throw storeError() }
        } else if update != errSecSuccess { throw storeError() }
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
        var folder = directory
        var flags = URLResourceValues()
        flags.isExcludedFromBackup = true
        try folder.setResourceValues(flags)
        try SecureWorkEnvelope.encode(work,code:identity.code,clientID:identity.clientID).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }
    func clear() throws {
        // Clear only after the matching server receipt. Keep the token until file removal succeeds.
        if FileManager.default.fileExists(atPath: file.path) { try FileManager.default.removeItem(at: file) }
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw storeError() }
    }
    private func storeError() -> NSError {
        NSError(domain: "GradeCrewSecureStorage", code: 1, userInfo: [NSLocalizedDescriptionKey: "Der Prüfungsstand konnte nicht sicher auf diesem iPad gespeichert werden. Bitte die Lehrkraft informieren."])
    }
}
