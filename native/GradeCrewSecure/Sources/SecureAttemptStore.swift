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
    func legacyTestWorkExists() throws -> Bool
    func identity() throws -> SecureAttemptIdentity?
    func work() throws -> SecureSavedWork
    func save(identity:SecureAttemptIdentity,work:SecureSavedWork) throws
    func clear() throws
    func archiveReplaced(identity:SecureAttemptIdentity,work:SecureSavedWork,receipt:SecureReplacementReceipt) throws
}
extension SecureAttemptPersistence {
    func legacyTestWorkExists() throws -> Bool { false }
    func archiveReplaced(identity:SecureAttemptIdentity,work:SecureSavedWork,receipt:SecureReplacementReceipt) throws { throw NSError(domain:"GradeCrewSecureStorage",code:3,userInfo:[NSLocalizedDescriptionKey:"Der alte Prüfungsstand konnte nicht geschützt archiviert werden. Er bleibt erhalten."]) }
}
protocol SecureIdentityVault {
    func read(_ account:String) throws -> Data?
    func write(_ data:Data,account:String) throws
    func remove(_ account:String) throws
}
private final class SecureKeychainIdentityVault:SecureIdentityVault {
    let service:String
    init(service:String){self.service=service}
    private func query(_ account:String)->[String:Any]{[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:account]}
    private func failure(_ status:OSStatus)->NSError{NSError(domain:NSOSStatusErrorDomain,code:Int(status),userInfo:[NSLocalizedDescriptionKey:"Der Prüfungszugang konnte nicht sicher im Schlüsselbund gespeichert werden."])}
    func read(_ account:String)throws->Data?{var q=query(account);q[kSecReturnData as String]=true;q[kSecMatchLimit as String]=kSecMatchLimitOne;var value:CFTypeRef?;let status=SecItemCopyMatching(q as CFDictionary,&value);if status==errSecItemNotFound{return nil};guard status==errSecSuccess,let bytes=value as? Data else{throw failure(status)};return bytes}
    func write(_ data:Data,account:String)throws{let q=query(account),attributes:[String:Any]=[kSecValueData as String:data,kSecAttrAccessible as String:kSecAttrAccessibleWhenUnlockedThisDeviceOnly];let status=SecItemUpdate(q as CFDictionary,attributes as CFDictionary);if status==errSecItemNotFound{var add=q;attributes.forEach{add[$0.key]=$0.value};let added=SecItemAdd(add as CFDictionary,nil);guard added==errSecSuccess else{throw failure(added)}}else if status != errSecSuccess{throw failure(status)}}
    func remove(_ account:String)throws{let status=SecItemDelete(query(account) as CFDictionary);guard status==errSecSuccess||status==errSecItemNotFound else{throw failure(status)}}
}
final class SecureAttemptStore:SecureAttemptPersistence {
    private let namespace:String
    private let vault:any SecureIdentityVault
    init(namespace:String="",vault:(any SecureIdentityVault)?=nil) {
        precondition(namespace.isEmpty || namespace.range(of:"^[a-zA-Z0-9_-]{1,128}$",options:.regularExpression) != nil)
        self.namespace=namespace
        self.vault=vault ?? SecureKeychainIdentityVault(service:SecureReleaseEnvironment.attemptService+(namespace.isEmpty ? "" : "."+namespace))
    }
    private var directory: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent(SecureReleaseEnvironment.workDirectory+(namespace.isEmpty ? "" : "-"+namespace), isDirectory: true)
    }
    private var file: URL { directory.appendingPathComponent("answers.json") }
    func legacyTestWorkExists() throws -> Bool {
        // Preserve pending work from the historical 2026 build in this same app.
        // Read only: do not migrate its identity or answers into the Live store.
        guard !SecureReleaseEnvironment.isStaging else { return false }
        let legacy=SecureKeychainIdentityVault(service:"de.gradecrew.secure.test2026-attempt-v1")
        let pending=try legacy.read("identity") != nil
        let oldFile=FileManager.default.urls(for:.applicationSupportDirectory,in:.userDomainMask)[0]
            .appendingPathComponent("SecureTest2026",isDirectory:true).appendingPathComponent("answers.json")
        return pending || FileManager.default.fileExists(atPath:oldFile.path)
    }
    func identity() throws -> SecureAttemptIdentity? {
        guard let data=try vault.read("identity") else{return nil}
        return try JSONDecoder().decode(SecureAttemptIdentity.self,from:data)
    }
    func work() throws -> SecureSavedWork {
        guard FileManager.default.fileExists(atPath: file.path) else { return SecureSavedWork() }
        guard let identity = try identity() else { throw storeError() }
        return try SecureWorkEnvelope.decode(Data(contentsOf:file),code:identity.code,clientID:identity.clientID,attemptID:identity.attemptID)
    }
    func save(identity: SecureAttemptIdentity, work: SecureSavedWork) throws {
        try vault.write(JSONEncoder().encode(identity),account:"identity")
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
        try vault.remove("identity")
    }
    func archiveReplaced(identity:SecureAttemptIdentity,work:SecureSavedWork,receipt:SecureReplacementReceipt) throws {
        guard let current=try self.identity(),current.clientID==identity.clientID,current.token==identity.token,current.attemptID==receipt.oldAttemptId,let binding=identity.classroom,binding.assignmentID==receipt.assignmentId,binding.generation==receipt.oldGeneration else { throw storeError() }
        guard identity.clientID.range(of:"^[a-zA-Z0-9_-]{1,128}$",options:.regularExpression) != nil else{throw storeError()}
        let archives=directory.appendingPathComponent("replaced",isDirectory:true)
        try FileManager.default.createDirectory(at:archives,withIntermediateDirectories:true,attributes:[.protectionKey:FileProtectionType.completeUntilFirstUserAuthentication])
        var folder=archives;var flags=URLResourceValues();flags.isExcludedFromBackup=true;try folder.setResourceValues(flags)
        // The archive filename contains only an opaque local client ID, no code or token.
        let target=archives.appendingPathComponent(identity.clientID+".json")
        let account="replaced."+identity.clientID
        if let bytes=try vault.read(account) {guard try JSONDecoder().decode(SecureAttemptIdentity.self,from:bytes).token==identity.token else{throw storeError()}}
        else {try vault.write(JSONEncoder().encode(identity),account:account)}
        if !FileManager.default.fileExists(atPath:target.path) {
            try SecureWorkEnvelope.encode(work,code:identity.code,clientID:identity.clientID).write(to:target,options:[.atomic,.completeFileProtectionUntilFirstUserAuthentication])
        }
        let archivedBytes=try Data(contentsOf:target)
        _ = try SecureWorkEnvelope.decode(archivedBytes,code:identity.code,clientID:identity.clientID,attemptID:identity.attemptID)
        // Persist the authorization separately; a crash can retry the same transfer.
        try JSONEncoder().encode(receipt).write(to:archives.appendingPathComponent(identity.clientID+".receipt.json"),options:[.atomic,.completeFileProtectionUntilFirstUserAuthentication])
        let activeBytes=FileManager.default.fileExists(atPath:file.path) ? try Data(contentsOf:file) : nil
        do {
            if activeBytes != nil {try FileManager.default.removeItem(at:file)}
            try vault.remove("identity")
        } catch {
            if let activeBytes {try activeBytes.write(to:file,options:[.atomic,.completeFileProtectionUntilFirstUserAuthentication])}
            throw error
        }
    }
    private func storeError(status:OSStatus=0) -> NSError {
        NSError(domain: "GradeCrewSecureStorage", code: 1, userInfo: [NSUnderlyingErrorKey:NSError(domain:NSOSStatusErrorDomain,code:Int(status)),NSLocalizedDescriptionKey: "Der Prüfungsstand konnte nicht sicher auf diesem iPad gespeichert werden. Bitte die Lehrkraft informieren."])
    }
}
